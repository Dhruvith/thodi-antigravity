import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const userId = (decoded as any).userId;

        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { id: userId } }
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true
                    }
                }
            },
            orderBy: { updatedAt: 'desc' }
        });

        const enriched = conversations.map((conv) => {
            const otherParticipants = conv.participants.filter(p => p.id !== userId);
            return {
                ...conv,
                otherParticipants
            };
        });

        return NextResponse.json(enriched);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const { recipientId, message } = await req.json();

        let conversation = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { id: userId } } },
                    { participants: { some: { id: recipientId } } }
                ]
            }
        });

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    isGroup: false,
                    lastMessage: message,
                    lastMessageAt: new Date(),
                    participants: {
                        connect: [
                            { id: userId },
                            { id: recipientId }
                        ]
                    }
                }
            });
        } else {
            conversation = await prisma.conversation.update({
                where: { id: conversation.id },
                data: {
                    lastMessage: message,
                    lastMessageAt: new Date(),
                }
            });
        }

        const newMessage = await prisma.message.create({
            data: {
                conversationId: conversation.id,
                senderId: userId,
                content: message,
                readBy: [userId],
                type: 'text'
            }
        });

        return NextResponse.json(newMessage);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
