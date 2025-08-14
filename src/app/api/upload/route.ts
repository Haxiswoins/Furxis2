
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { mkdir } from 'fs/promises';

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename to avoid overwrites
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const publicPath = join(process.cwd(), 'public', 'uploads');
    const filePath = join(publicPath, filename);

    // Ensure the uploads directory exists
    await mkdir(publicPath, { recursive: true });

    await writeFile(filePath, buffer);

    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    console.error(`[API/UPLOAD] File upload failed:`, message);
    return NextResponse.json({ message: `File upload failed: ${message}` }, { status: 500 });
  }
}
