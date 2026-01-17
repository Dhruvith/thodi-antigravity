import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json(
                { message: 'Missing required fields' },
                { status: 400 }
            );
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return NextResponse.json(
                { message: 'User already exists' },
                { status: 409 }
            );
        }

        const hashedPassword = await hashPassword(password);
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                privacySettings: { publicProfile: true, showEmail: false },
            },
        });

        const { password: _, ...userWithoutPassword } = newUser;

        const token = signToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

        return NextResponse.json(
            {
                message: 'User created successfully',
                token,
                user: userWithoutPassword,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json(
            { message: 'Internal server error', error: error.message },
            { status: 500 }
        );
    }
}
