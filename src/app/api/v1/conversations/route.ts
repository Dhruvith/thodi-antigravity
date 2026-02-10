import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/conversations — List all conversations for the authenticated user
// Query params: ?page=1&limit=20&search=keyword
export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const userId = (decoded as any).userId;
        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const search = searchParams.get('search') || '';
        const skip = (page - 1) * limit;

        const whereClause: any = {
            participants: { some: { id: userId } }
        };

        // Search by conversation name or participant name
        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { participants: { some: { name: { contains: search, mode: 'insensitive' }, id: { not: userId } } } }
            ];
        }

        const [conversations, totalCount] = await Promise.all([
            prisma.conversation.findMany({
                where: whereClause,
                include: {
                    participants: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true,
                            isOnline: true,
                            lastSeen: true,
                        }
                    },
                    messages: {
                        orderBy: { createdAt: 'desc' },
                        take: 1,
                        select: {
                            id: true,
                            content: true,
                            type: true,
                            senderId: true,
                            createdAt: true,
                            isDeleted: true,
                        }
                    }
                },
                orderBy: [
                    { lastMessageAt: { sort: 'desc', nulls: 'last' } },
                    { updatedAt: 'desc' }
                ],
                skip,
                take: limit,
            }),
            prisma.conversation.count({ where: whereClause })
        ]);

        // Calculate unread count for each conversation
        const enriched = await Promise.all(conversations.map(async (conv) => {


            // Get actual unread (filter readBy in app layer since it's JSON)
            const unreadMessages = await prisma.message.findMany({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isDeleted: false,
                },
                select: { readBy: true }
            });

            const actualUnread = unreadMessages.filter(msg => {
                const readBy = (msg.readBy as string[]) || [];
                return !readBy.includes(userId);
            }).length;

            const otherParticipants = conv.participants.filter(p => p.id !== userId);
            const lastMessage = conv.messages[0] || null;

            return {
                id: conv.id,
                isGroup: conv.isGroup,
                name: conv.isGroup ? conv.name : otherParticipants[0]?.name || 'Unknown',
                groupAvatar: conv.groupAvatar,
                adminId: conv.adminId,
                otherParticipants,
                participants: conv.participants,
                lastMessage: lastMessage ? {
                    ...lastMessage,
                    content: lastMessage.isDeleted ? 'This message was deleted' : lastMessage.content,
                } : null,
                unreadCount: actualUnread,
                lastMessageAt: conv.lastMessageAt,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
            };
        }));

        return NextResponse.json({
            conversations: enriched,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
            }
        });
    } catch (error: any) {
        console.error('GET conversations error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/v1/conversations — Create or get a conversation
// Body for 1-on-1: { recipientId: "...", message: "..." }
// Body for group: { isGroup: true, name: "Group Name", participantIds: ["id1","id2"], message: "..." }
export async function POST(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const body = await req.json();
        const { recipientId, isGroup, name, participantIds, message } = body;

        // ── Group Chat Creation ──
        if (isGroup) {
            if (!name || !participantIds || !Array.isArray(participantIds) || participantIds.length < 1) {
                return NextResponse.json(
                    { message: 'Group name and at least 1 other participant required' },
                    { status: 400 }
                );
            }

            // Include the creator as a participant
            const allParticipantIds = [...new Set([userId, ...participantIds])];

            const conversation = await prisma.conversation.create({
                data: {
                    isGroup: true,
                    name,
                    adminId: userId,
                    lastMessage: message || `${(decoded as any).email} created group "${name}"`,
                    lastMessageAt: new Date(),
                    participants: {
                        connect: allParticipantIds.map(id => ({ id }))
                    }
                },
                include: {
                    participants: {
                        select: { id: true, name: true, email: true, avatar: true, isOnline: true, lastSeen: true }
                    }
                }
            });

            // Create system message for group creation
            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: message || `Group "${name}" created`,
                    type: 'system',
                    readBy: [userId],
                }
            });

            return NextResponse.json(conversation, { status: 201 });
        }

        // ── 1-on-1 Chat ──
        if (!recipientId) {
            return NextResponse.json({ message: 'recipientId is required' }, { status: 400 });
        }

        if (recipientId === userId) {
            return NextResponse.json({ message: 'Cannot start a conversation with yourself' }, { status: 400 });
        }

        // Check if recipient exists
        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
        if (!recipient) {
            return NextResponse.json({ message: 'Recipient not found' }, { status: 404 });
        }

        // Check if blocked
        const blocked = await prisma.blockedUser.findFirst({
            where: {
                OR: [
                    { blockerId: userId, blockedId: recipientId },
                    { blockerId: recipientId, blockedId: userId }
                ]
            }
        });
        if (blocked) {
            return NextResponse.json({ message: 'Cannot message this user' }, { status: 403 });
        }

        // Check if conversation already exists
        let conversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: recipientId } } }
                ]
            },
            include: {
                participants: {
                    select: { id: true, name: true, email: true, avatar: true, isOnline: true, lastSeen: true }
                }
            }
        });

        if (conversation && message) {
            // Update existing conversation
            conversation = await prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    lastMessage: message,
                    lastMessageAt: new Date(),
                },
                include: {
                    participants: {
                        select: { id: true, name: true, email: true, avatar: true, isOnline: true, lastSeen: true }
                    }
                }
            });

            await prisma.message.create({
                data: {
                    conversationId: conversation.id,
                    senderId: userId,
                    content: message,
                    readBy: [userId],
                    type: 'text'
                }
            });

            return NextResponse.json(conversation);
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    isGroup: false,
                    lastMessage: message || null,
                    lastMessageAt: message ? new Date() : null,
                    participants: {
                        connect: [{ id: userId }, { id: recipientId }]
                    }
                },
                include: {
                    participants: {
                        select: { id: true, name: true, email: true, avatar: true, isOnline: true, lastSeen: true }
                    }
                }
            });

            if (message) {
                await prisma.message.create({
                    data: {
                        conversationId: conversation.id,
                        senderId: userId,
                        content: message,
                        readBy: [userId],
                        type: 'text'
                    }
                });
            }

            return NextResponse.json(conversation, { status: 201 });
        }

        return NextResponse.json(conversation);
    } catch (error: any) {
        console.error('POST conversations error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
