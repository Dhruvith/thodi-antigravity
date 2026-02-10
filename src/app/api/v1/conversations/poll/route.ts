import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/conversations/poll — Global poll for conversation updates
// Query params: ?since=2026-02-10T12:00:00Z
// This endpoint returns conversation list updates since the given timestamp.
// The React Native app should call this every 5 seconds on the conversations list screen.
export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const { searchParams } = new URL(req.url);
        const since = searchParams.get('since');

        if (!since) {
            return NextResponse.json({ message: 'since parameter is required (ISO timestamp)' }, { status: 400 });
        }

        const sinceDate = new Date(since);

        // Get conversations that have been updated since the timestamp
        const updatedConversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } },
                updatedAt: { gt: sinceDate },
            },
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
            orderBy: { updatedAt: 'desc' },
        });

        // Enrich with unread counts
        const enriched = await Promise.all(updatedConversations.map(async (conv) => {
            const unreadMessages = await prisma.message.findMany({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    isDeleted: false,
                },
                select: { readBy: true }
            });

            const unreadCount = unreadMessages.filter(msg => {
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
                lastMessage: lastMessage ? {
                    ...lastMessage,
                    content: lastMessage.isDeleted ? 'This message was deleted' : lastMessage.content,
                } : null,
                unreadCount,
                lastMessageAt: conv.lastMessageAt,
                updatedAt: conv.updatedAt,
            };
        }));

        // Total unread count across all conversations
        const allConversations = await prisma.conversation.findMany({
            where: { participants: { some: { id: userId } } },
            select: { id: true }
        });

        const allUnread = await prisma.message.findMany({
            where: {
                conversationId: { in: allConversations.map(c => c.id) },
                senderId: { not: userId },
                isDeleted: false,
            },
            select: { readBy: true }
        });

        const totalUnread = allUnread.filter(msg => {
            const readBy = (msg.readBy as string[]) || [];
            return !readBy.includes(userId);
        }).length;

        // Update user online status
        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date(), isOnline: true }
        });

        return NextResponse.json({
            updatedConversations: enriched,
            totalUnreadCount: totalUnread,
            serverTime: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Global poll error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
