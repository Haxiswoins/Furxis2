
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const commissions = await readData();
    const commission = commissions.find(c => c.id === params.id);

    if (!commission) {
      return NextResponse.json({ message: 'Commission option not found' }, { status: 404 });
    }
    return NextResponse.json(commission);
  } catch (error) {
    console.error(`[API/COMMISSIONS/GET_BY_ID] Failed to read data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to read data' }, { status: 500 });
  }
}

const putSchema = z.object({
    name: z.string(),
    category: z.string(),
    price: z.string(),
    status: z.enum(['开放中', '已结束', '即将开放']),
    description: z.string(),
    tags: z.array(z.string()),
    imageUrl: z.string(),
});

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const validation = putSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid data', errors: validation.error.errors }, { status: 400 });
    }

    let commissions = await readData();
    const index = commissions.findIndex(c => c.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Commission option not found' }, { status: 404 });
    }

    commissions[index] = { ...commissions[index], ...validation.data };
    await writeData(commissions);

    return NextResponse.json(commissions[index]);
  } catch (error) {
    console.error(`[API/COMMISSIONS/PUT] Failed to write data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let commissions = await readData();
    const originalLength = commissions.length;
    const filteredCommissions = commissions.filter(c => c.id !== params.id);

    if (originalLength === filteredCommissions.length) {
      return NextResponse.json({ message: 'Commission option not found' }, { status: 404 });
    }

    await writeData(filteredCommissions);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/COMMISSIONS/DELETE] Failed to delete data for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error: Failed to write data' }, { status: 500 });
  }
}
