import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json(
                { message: 'Missing email or password' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user || !user.password) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const isValid = await comparePassword(password, user.password);

        if (!isValid) {
            return NextResponse.json(
                { message: 'Invalid credentials' },
                { status: 401 }
            );
        }

        const token = signToken({ userId: user.id, email: user.email, role: user.role });

        const { password: _, ...userObj } = user;

        return NextResponse.json(
            {
                message: 'Login successful',
                token,
                user: userObj,
            },
            { status: 200 }
        );
    } catch (error: any) {
        console.error('Login error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
