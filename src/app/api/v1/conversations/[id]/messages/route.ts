import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/conversations/:id/messages — Get messages with pagination
// Query params: ?page=1&limit=50&before=timestamp&after=timestamp
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                participants: { some: { id: userId } }
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
        const before = searchParams.get('before');
        const after = searchParams.get('after');
        const skip = (page - 1) * limit;

        const whereClause: any = { conversationId: id };

        if (before) {
            whereClause.createdAt = { ...whereClause.createdAt, lt: new Date(before) };
        }
        if (after) {
            whereClause.createdAt = { ...whereClause.createdAt, gt: new Date(after) };
        }

        const [messages, totalCount] = await Promise.all([
            prisma.message.findMany({
                where: whereClause,
                include: {
                    sender: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            }),
            prisma.message.count({ where: whereClause })
        ]);

        // Map deleted messages
        const sanitized = messages.map(msg => ({
            ...msg,
            content: msg.isDeleted ? 'This message was deleted' : msg.content,
            fileUrl: msg.isDeleted ? null : msg.fileUrl,
        }));

        // Reverse to show oldest first (since we fetch desc for proper pagination)
        sanitized.reverse();

        return NextResponse.json({
            messages: sanitized,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
            }
        });
    } catch (error: any) {
        console.error('GET messages error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/v1/conversations/:id/messages — Send a message
// Body: { content: "...", type?: "text"|"image"|"file"|"audio"|"video", fileUrl?: "...", replyToId?: "..." }
export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        // Verify user is participant
        const conversation = await prisma.conversation.findFirst({
            where: {
                id,
                participants: { some: { id: userId } }
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found or access denied' }, { status: 404 });
        }

        // Check if blocked (for 1-on-1 only)
        if (!conversation.isGroup) {
            const conv = await prisma.conversation.findUnique({
                where: { id },
                include: { participants: { select: { id: true } } }
            });
            const otherUserId = conv?.participants.find(p => p.id !== userId)?.id;
            if (otherUserId) {
                const blocked = await prisma.blockedUser.findFirst({
                    where: {
                        OR: [
                            { blockerId: userId, blockedId: otherUserId },
                            { blockerId: otherUserId, blockedId: userId }
                        ]
                    }
                });
                if (blocked) {
                    return NextResponse.json({ message: 'Cannot send message to this user' }, { status: 403 });
                }
            }
        }

        const { content, type, fileUrl, replyToId } = await req.json();

        if (!content && !fileUrl) {
            return NextResponse.json({ message: 'Message content or file is required' }, { status: 400 });
        }

        // Validate replyToId if provided
        if (replyToId) {
            const replyMsg = await prisma.message.findFirst({
                where: { id: replyToId, conversationId: id }
            });
            if (!replyMsg) {
                return NextResponse.json({ message: 'Reply message not found in this conversation' }, { status: 400 });
            }
        }

        const messageContent = content || (type === 'image' ? '📷 Image' : type === 'audio' ? '🎵 Audio' : type === 'video' ? '📹 Video' : '📎 File');

        const newMessage = await prisma.message.create({
            data: {
                conversationId: id,
                senderId: userId,
                content: messageContent,
                type: type || 'text',
                fileUrl,
                replyToId: replyToId || null,
                readBy: [userId],
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    }
                }
            }
        });

        // Update conversation last activity
        await prisma.conversation.update({
            where: { id },
            data: {
                lastMessage: messageContent,
                lastMessageAt: new Date()
            }
        });

        // Update user's online status
        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date(), isOnline: true }
        });

        return NextResponse.json(newMessage, { status: 201 });
    } catch (error: any) {
        console.error('POST message error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH /api/v1/conversations/:id/messages — Mark all messages as read
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        // Find unread messages from other users
        const messages = await prisma.message.findMany({
            where: {
                conversationId: id,
                senderId: { not: userId },
                isDeleted: false,
            },
            select: { id: true, readBy: true }
        });

        const unreadMessages = messages.filter(msg => {
            const readBy = (msg.readBy as string[]) || [];
            return !readBy.includes(userId);
        });

        // Mark as read
        await Promise.all(unreadMessages.map(msg => {
            const currentReadBy = (msg.readBy as string[]) || [];
            return prisma.message.update({
                where: { id: msg.id },
                data: {
                    readBy: [...currentReadBy, userId]
                }
            });
        }));

        return NextResponse.json({
            message: 'Messages marked as read',
            count: unreadMessages.length
        });
    } catch (error: any) {
        console.error('PATCH messages error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
