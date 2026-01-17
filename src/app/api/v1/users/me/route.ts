import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

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

        return NextResponse.json(
            {
                user: userObj,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Profile error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
