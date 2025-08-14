import { NextRequest, NextResponse } from 'next/server';
import { getSiteContent, saveSiteContent } from '@/lib/data-service';

export async function GET() {
  try {
    const data = await getSiteContent();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/SITE-CONTENT/GET] Failed to read site content:', error);
    return NextResponse.json({ message: 'Error reading site content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await saveSiteContent(body);
    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('[API/SITE-CONTENT/POST] Failed to write site content:', error);
    return NextResponse.json({ message: 'Error writing site content' }, { status: 500 });
  }
}
