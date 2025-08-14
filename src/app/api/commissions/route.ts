import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getCommissionOptionsHandler, saveCommissionOptionHandler } from '@/lib/data-handler';

export async function GET() {
  try {
    const data = await getCommissionOptionsHandler();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/COMMISSIONS/GET] Failed to read data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const postSchema = z.object({
  name: z.string(),
  category: z.string(),
  price: z.string(),
  status: z.enum(['开放中', '已结束', '即将开放']),
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

    const newCommission = await saveCommissionOptionHandler(validation.data);
    return NextResponse.json(newCommission, { status: 201 });
  } catch (error) {
    console.error('[API/COMMISSIONS/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
