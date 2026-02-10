import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// GET /api/v1/users — Search & list users (excludes current user)
// Query params: ?search=keyword&page=1&limit=20
export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const currentUserId = (decoded as any).userId;

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search') || '';
        const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
        const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));
        const skip = (page - 1) * limit;

        // Get blocked user IDs to exclude
        const blockedRelations = await prisma.blockedUser.findMany({
            where: {
                OR: [
                    { blockerId: currentUserId },
                    { blockedId: currentUserId }
                ]
            },
            select: { blockerId: true, blockedId: true }
        });

        const blockedIds = blockedRelations.map(b =>
            b.blockerId === currentUserId ? b.blockedId : b.blockerId
        );

        const excludeIds = [currentUserId, ...blockedIds];

        const whereClause: any = {
            id: { notIn: excludeIds },
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { email: { contains: search } },
            ];
        }

        const [users, totalCount] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    bio: true,
                    isOnline: true,
                    lastSeen: true,
                },
                orderBy: { name: 'asc' },
                skip,
                take: limit,
            }),
            prisma.user.count({ where: whereClause })
        ]);

        return NextResponse.json({
            users,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages: Math.ceil(totalCount / limit),
                hasMore: page * limit < totalCount,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
