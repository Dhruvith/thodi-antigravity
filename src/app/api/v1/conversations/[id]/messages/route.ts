import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const messages = await prisma.message.findMany({
            where: { conversationId: id },
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const { content, type, fileUrl } = await req.json();

        const newMessage = await prisma.message.create({
            data: {
                conversationId: id,
                senderId: userId,
                content: content || (type === 'image' ? 'Sent an image' : 'Sent a file'),
                type: type || 'text',
                fileUrl,
                readBy: [userId]
            }
        });

        // Update conversation last activity
        await prisma.conversation.update({
            where: { id },
            data: {
                lastMessage: newMessage.content,
                lastMessageAt: new Date()
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
