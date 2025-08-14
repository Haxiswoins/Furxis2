import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommissionStylesHandler, saveCommissionStyleHandler } from '@/lib/data-handler';

export async function GET() {
  try {
    const data = await getCommissionStylesHandler();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/COMMISSION-STYLES/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const postSchema = z.object({
  commissionOptionId: z.string(),
  name: z.string(),
  price: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validation = postSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    const newStyle = await saveCommissionStyleHandler(validation.data);
    return NextResponse.json(newStyle, { status: 201 });
  } catch (error) {
    console.error('[API/COMMISSION-STYLES/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
