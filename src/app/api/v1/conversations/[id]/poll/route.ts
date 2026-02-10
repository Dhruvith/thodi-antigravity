import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/conversations/:id/poll — Poll for new messages since a given timestamp
// Query params: ?since=2026-02-10T12:00:00Z
// This is the endpoint your React Native app should call every 2-3 seconds
// to get new messages in real-time (long polling alternative to WebSockets)
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
            },
            include: {
                participants: {
                    select: { id: true, name: true, isOnline: true, lastSeen: true }
                }
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const since = searchParams.get('since');

        if (!since) {
            return NextResponse.json({ message: 'since parameter is required (ISO timestamp)' }, { status: 400 });
        }

        const sinceDate = new Date(since);

        // Get new messages since the timestamp
        const newMessages = await prisma.message.findMany({
            where: {
                conversationId: id,
                createdAt: { gt: sinceDate },
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });

        // Get updated messages (edited/deleted)
        const updatedMessages = await prisma.message.findMany({
            where: {
                conversationId: id,
                updatedAt: { gt: sinceDate },
                createdAt: { lte: sinceDate },
            },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            },
            orderBy: { updatedAt: 'asc' }
        });

        // Sanitize deleted messages
        const sanitize = (msg: any) => ({
            ...msg,
            content: msg.isDeleted ? 'This message was deleted' : msg.content,
            fileUrl: msg.isDeleted ? null : msg.fileUrl,
        });

        // Update this user's online status
        await prisma.user.update({
            where: { id: userId },
            data: { lastSeen: new Date(), isOnline: true }
        });

        // Get other participants' online status
        const participantStatuses = conversation.participants
            .filter(p => p.id !== userId)
            .map(p => ({
                userId: p.id,
                name: p.name,
                isOnline: p.isOnline,
                lastSeen: p.lastSeen,
            }));

        return NextResponse.json({
            newMessages: newMessages.map(sanitize),
            updatedMessages: updatedMessages.map(sanitize),
            participantStatuses,
            serverTime: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Poll error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
