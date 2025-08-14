
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { CommissionOption } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'commissionOptions.json');

async function readData(): Promise<CommissionOption[]> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: CommissionOption[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = await readData();
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

    const commissions = await readData();
    const newCommission: CommissionOption = {
      id: `comm_${Date.now()}`,
      ...validation.data,
    };
    commissions.push(newCommission);
    await writeData(commissions);
    
    return NextResponse.json(newCommission, { status: 201 });
  } catch (error) {
    console.error('[API/COMMISSIONS/POST] Failed to write data:', error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
