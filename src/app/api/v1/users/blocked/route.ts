import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/users/blocked — Get list of blocked users
export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const blockedUsers = await prisma.blockedUser.findMany({
            where: { blockerId: userId },
            include: {
                blocked: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatar: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({
            blockedUsers: blockedUsers.map(b => ({
                ...b.blocked,
                blockedAt: b.createdAt,
            }))
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST /api/v1/users/blocked — Block a user
// Body: { userId: "..." }
export async function POST(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const currentUserId = (decoded as any).userId;

        const { userId: targetUserId } = await req.json();

        if (!targetUserId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 });
        }

        if (targetUserId === currentUserId) {
            return NextResponse.json({ message: 'Cannot block yourself' }, { status: 400 });
        }

        // Check if already blocked
        const existing = await prisma.blockedUser.findUnique({
            where: {
                blockerId_blockedId: {
                    blockerId: currentUserId,
                    blockedId: targetUserId,
                }
            }
        });

        if (existing) {
            return NextResponse.json({ message: 'User already blocked' }, { status: 409 });
        }

        await prisma.blockedUser.create({
            data: {
                blockerId: currentUserId,
                blockedId: targetUserId,
            }
        });

        return NextResponse.json({ message: 'User blocked successfully' }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// DELETE /api/v1/users/blocked — Unblock a user
// Body: { userId: "..." }
export async function DELETE(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const currentUserId = (decoded as any).userId;

        const { userId: targetUserId } = await req.json();

        if (!targetUserId) {
            return NextResponse.json({ message: 'userId is required' }, { status: 400 });
        }

        await prisma.blockedUser.deleteMany({
            where: {
                blockerId: currentUserId,
                blockedId: targetUserId,
            }
        });

        return NextResponse.json({ message: 'User unblocked successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
