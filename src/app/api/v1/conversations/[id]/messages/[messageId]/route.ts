import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// DELETE /api/v1/conversations/:id/messages/:messageId — Soft-delete a message
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const { id, messageId } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                conversationId: id,
                senderId: userId,
            }
        });

        if (!message) {
            return NextResponse.json({ message: 'Message not found or you cannot delete it' }, { status: 404 });
        }

        // Soft delete — keep the message, but mark it as deleted
        const updated = await prisma.message.update({
            where: { id: messageId },
            data: {
                isDeleted: true,
                content: 'This message was deleted',
                fileUrl: null,
            }
        });

        return NextResponse.json({ message: 'Message deleted', id: updated.id });
    } catch (error: any) {
        console.error('DELETE message error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH /api/v1/conversations/:id/messages/:messageId — Edit a message (within 15 minutes)
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string; messageId: string }> }
) {
    try {
        const { id, messageId } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                conversationId: id,
                senderId: userId,
                isDeleted: false,
            }
        });

        if (!message) {
            return NextResponse.json({ message: 'Message not found or you cannot edit it' }, { status: 404 });
        }

        // Only allow editing within 15 minutes
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (message.createdAt < fifteenMinutesAgo) {
            return NextResponse.json({ message: 'Cannot edit messages older than 15 minutes' }, { status: 400 });
        }

        const { content } = await req.json();
        if (!content || content.trim() === '') {
            return NextResponse.json({ message: 'Content is required' }, { status: 400 });
        }

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { content: content.trim() },
            include: {
                sender: {
                    select: { id: true, name: true, avatar: true }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('PATCH message error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
