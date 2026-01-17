import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const currentUserId = (decoded as any).userId;

        const users = await prisma.user.findMany({
            where: { id: { not: currentUserId } },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true
            }
        });
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
