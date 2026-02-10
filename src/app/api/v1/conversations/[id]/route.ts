import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/conversations/:id — Get single conversation details
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: {
                participants: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                        isOnline: true,
                        lastSeen: true,
                        bio: true,
                    }
                },
            }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        // Verify user is a participant
        const isParticipant = conversation.participants.some(p => p.id === userId);
        if (!isParticipant) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const otherParticipants = conversation.participants.filter(p => p.id !== userId);

        return NextResponse.json({
            ...conversation,
            otherParticipants,
        });
    } catch (error: any) {
        console.error('GET conversation error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// PATCH /api/v1/conversations/:id — Update conversation (group name, add/remove members)
// Body: { name?: string, addParticipantIds?: string[], removeParticipantIds?: string[], groupAvatar?: string }
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: { participants: { select: { id: true } } }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        // Only group admins can modify group settings
        if (conversation.isGroup && conversation.adminId !== userId) {
            return NextResponse.json({ message: 'Only group admin can modify this conversation' }, { status: 403 });
        }

        if (!conversation.isGroup) {
            return NextResponse.json({ message: 'Cannot modify a private conversation' }, { status: 400 });
        }

        const { name, addParticipantIds, removeParticipantIds, groupAvatar } = await req.json();

        const updateData: any = {};
        const connectIds: { id: string }[] = [];
        const disconnectIds: { id: string }[] = [];

        if (name) updateData.name = name;
        if (groupAvatar) updateData.groupAvatar = groupAvatar;

        if (addParticipantIds && Array.isArray(addParticipantIds)) {
            addParticipantIds.forEach((pid: string) => connectIds.push({ id: pid }));
        }

        if (removeParticipantIds && Array.isArray(removeParticipantIds)) {
            // Cannot remove admin
            const filteredRemove = removeParticipantIds.filter((pid: string) => pid !== conversation.adminId);
            filteredRemove.forEach((pid: string) => disconnectIds.push({ id: pid }));
        }

        const updated = await prisma.conversation.update({
            where: { id },
            data: {
                ...updateData,
                participants: {
                    ...(connectIds.length > 0 ? { connect: connectIds } : {}),
                    ...(disconnectIds.length > 0 ? { disconnect: disconnectIds } : {}),
                }
            },
            include: {
                participants: {
                    select: { id: true, name: true, email: true, avatar: true, isOnline: true, lastSeen: true }
                }
            }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('PATCH conversation error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/v1/conversations/:id — Delete/leave a conversation
export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const conversation = await prisma.conversation.findUnique({
            where: { id },
            include: { participants: { select: { id: true } } }
        });

        if (!conversation) {
            return NextResponse.json({ message: 'Conversation not found' }, { status: 404 });
        }

        const isParticipant = conversation.participants.some(p => p.id === userId);
        if (!isParticipant) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        if (conversation.isGroup) {
            if (conversation.adminId === userId) {
                // Admin deletes the entire group + all messages
                await prisma.message.deleteMany({ where: { conversationId: id } });
                await prisma.conversation.delete({ where: { id } });
                return NextResponse.json({ message: 'Group deleted successfully' });
            } else {
                // Non-admin just leaves
                await prisma.conversation.update({
                    where: { id },
                    data: {
                        participants: { disconnect: { id: userId } }
                    }
                });
                return NextResponse.json({ message: 'Left group successfully' });
            }
        } else {
            // For 1-on-1, delete all messages and conversation
            await prisma.message.deleteMany({ where: { conversationId: id } });
            await prisma.conversation.delete({ where: { id } });
            return NextResponse.json({ message: 'Conversation deleted successfully' });
        }
    } catch (error: any) {
        console.error('DELETE conversation error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
