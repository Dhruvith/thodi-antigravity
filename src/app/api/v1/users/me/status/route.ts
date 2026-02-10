import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

// POST /api/v1/users/me/status — Update online status (heartbeat)
// Body: { isOnline: true }
// Your React Native app should call this every 30 seconds when the app is open
// When the app goes to background, call with { isOnline: false }
export async function POST(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        const userId = (decoded as any).userId;

        const { isOnline } = await req.json();

        await prisma.user.update({
            where: { id: userId },
            data: {
                isOnline: isOnline !== false,
                lastSeen: new Date(),
            }
        });

        return NextResponse.json({
            message: 'Status updated',
            isOnline: isOnline !== false,
            lastSeen: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Status update error:', error);
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}
