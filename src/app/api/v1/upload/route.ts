import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { getDecodedTokenFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
    try {
        const decoded = getDecodedTokenFromRequest(req);
        if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ message: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = uniqueSuffix + '-' + file.name.replace(/[^a-zA-Z0-9.-]/g, ''); // Sanitize filename

        // Save to public/uploads
        // Note: In a real production app, use S3/Cloudinary.
        const uploadDir = join(process.cwd(), 'public', 'uploads');

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        await writeFile(join(uploadDir, filename), buffer);

        const url = `/uploads/${filename}`;
        return NextResponse.json({ url, type: file.type });
    } catch (error: any) {
        console.error('Upload error:', error);
        return NextResponse.json({ message: 'Upload failed' }, { status: 500 });
    }
}
