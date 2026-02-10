import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest, hashPassword, comparePassword } from '@/lib/auth';

// GET /api/v1/users/me — Get current user profile
export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);

        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = (decoded as any).userId;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return NextResponse.json(
                { message: 'User not found' },
                { status: 404 }
            );
        }

        const { password: _, ...userObj } = user;

        // Get unread message count across all conversations
        const conversations = await prisma.conversation.findMany({
            where: { participants: { some: { id: userId } } },
            select: { id: true }
        });

        const allUnreadMessages = await prisma.message.findMany({
            where: {
                conversationId: { in: conversations.map(c => c.id) },
                senderId: { not: userId },
                isDeleted: false,
            },
            select: { readBy: true }
        });

        const totalUnread = allUnreadMessages.filter(msg => {
            const readBy = (msg.readBy as string[]) || [];
            return !readBy.includes(userId);
        }).length;

        return NextResponse.json({
            user: userObj,
            totalUnreadMessages: totalUnread,
        }, { status: 200 });
    } catch (error: any) {
        console.error('Profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}

// PATCH /api/v1/users/me — Update current user profile
// Body: { name?, avatar?, bio?, phone?, theme?, privacySettings? }
export async function PATCH(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded || typeof decoded === 'string') {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const userId = (decoded as any).userId;
        const body = await req.json();
        const { name, avatar, bio, phone, theme, privacySettings, currentPassword, newPassword } = body;

        const updateData: any = {};
        if (name !== undefined) updateData.name = name;
        if (avatar !== undefined) updateData.avatar = avatar;
        if (bio !== undefined) updateData.bio = bio;
        if (phone !== undefined) updateData.phone = phone;
        if (theme !== undefined) updateData.theme = theme;
        if (privacySettings !== undefined) updateData.privacySettings = privacySettings;

        // Password change
        if (newPassword) {
            if (!currentPassword) {
                return NextResponse.json({ message: 'Current password is required to change password' }, { status: 400 });
            }

            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user || !user.password) {
                return NextResponse.json({ message: 'User not found' }, { status: 404 });
            }

            const isValid = await comparePassword(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ message: 'Current password is incorrect' }, { status: 401 });
            }

            updateData.password = await hashPassword(newPassword);
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        const { password: _, ...userObj } = updatedUser;

        return NextResponse.json({
            message: 'Profile updated successfully',
            user: userObj,
        });
    } catch (error: any) {
        console.error('Profile update error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
