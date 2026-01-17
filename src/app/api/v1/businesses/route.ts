import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getDecodedTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const decoded: any = getDecodedTokenFromRequest(req);
        if (!decoded || !decoded.userId) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        const { name, category, description, contact, products, logo } = await req.json();

        if (!name || !category || !description || !contact) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newBusiness = await prisma.business.create({
            data: {
                userId: decoded.userId,
                name,
                category,
                description,
                contact: contact,
                products: products || [],
                logo,
                status: 'pending',
            },
        });

        return NextResponse.json(
            { message: 'Business listing submitted successfully', business: newBusiness },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Create Business Error:', error);
        return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const search = searchParams.get('search');

        const where: any = { status: 'approved' };

        if (category) {
            where.category = { contains: category };
        }

        if (search) {
            where.OR = [
                { name: { contains: search } },
                { description: { contains: search } },
            ];
        }

        const businesses = await prisma.business.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ businesses }, { status: 200 });
    } catch (error: any) {
        console.error('Get Businesses Error:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
