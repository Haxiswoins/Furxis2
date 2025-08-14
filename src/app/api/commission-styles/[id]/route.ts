
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import path from 'path';
import { promises as fs } from 'fs';
import type { CommissionStyle } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'commissionStyles.json');

async function readData(): Promise<CommissionStyle[]> {
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

async function writeData(data: CommissionStyle[]): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const styles = await readData();
    const style = styles.find(s => s.id === params.id);

    if (!style) {
      return NextResponse.json({ message: 'Commission style not found' }, { status: 404 });
    }
    return NextResponse.json(style);
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/GET_BY_ID] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

const putSchema = z.object({
  commissionOptionId: z.string(),
  name: z.string(),
  price: z.string(),
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

    let styles = await readData();
    const index = styles.findIndex(s => s.id === params.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Commission style not found' }, { status: 404 });
    }

    styles[index] = { ...styles[index], ...validation.data };
    await writeData(styles);

    return NextResponse.json(styles[index]);
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/PUT] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    let styles = await readData();
    const originalLength = styles.length;
    const filteredStyles = styles.filter(s => s.id !== params.id);

    if (originalLength === filteredStyles.length) {
      return NextResponse.json({ message: 'Commission style not found' }, { status: 404 });
    }

    await writeData(filteredStyles);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/DELETE] Failed for ID ${params.id}:`, error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
