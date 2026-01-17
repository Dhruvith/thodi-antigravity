import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    try {
        const { email, businessName, category } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        const existing = await prisma.waitlist.findUnique({
            where: { email }
        });

        if (existing) {
            return NextResponse.json({ message: 'You are already on the waitlist!' }, { status: 409 });
        }

        const waitlistEntry = await prisma.waitlist.create({
            data: {
                email,
                businessName,
                category,
                status: 'pending'
            }
        });

        return NextResponse.json(
            { message: 'Successfully joined the waitlist!', entry: waitlistEntry },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Waitlist Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
