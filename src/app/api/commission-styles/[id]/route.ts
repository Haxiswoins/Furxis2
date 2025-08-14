import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { CommissionStyle } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'commissionStyles.json');

async function getCommissionStylesHandler(): Promise<CommissionStyle[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function getCommissionStyleByIdHandler(id: string): Promise<CommissionStyle | null> {
    const styles = await getCommissionStylesHandler();
    return styles.find(s => s.id === id) || null;
}

async function saveCommissionStyleHandler(data: Omit<CommissionStyle, 'id'>, id?: string): Promise<CommissionStyle> {
    const styles = await getCommissionStylesHandler();
    if (id) {
        const index = styles.findIndex(s => s.id === id);
        if (index === -1) throw new Error('Commission style not found');
        const updatedStyle = { ...styles[index], ...data };
        styles[index] = updatedStyle;
        await fs.writeFile(filePath, JSON.stringify(styles, null, 2), 'utf8');
        return updatedStyle;
    } else {
        const newStyle: CommissionStyle = { id: `style_${Date.now()}`, ...data };
        styles.push(newStyle);
        await fs.writeFile(filePath, JSON.stringify(styles, null, 2), 'utf8');
        return newStyle;
    }
}

async function deleteCommissionStyleHandler(id: string): Promise<void> {
    const styles = await getCommissionStylesHandler();
    const filtered = styles.filter(s => s.id !== id);
    if (styles.length === filtered.length) throw new Error('Commission style not found');
    await fs.writeFile(filePath, JSON.stringify(filtered, null, 2), 'utf8');
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const style = await getCommissionStyleByIdHandler(params.id);
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

    const updatedStyle = await saveCommissionStyleHandler(validation.data, params.id);
    return NextResponse.json(updatedStyle);
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/PUT] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await deleteCommissionStyleHandler(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[API/COMMISSION-STYLES/DELETE] Failed for ID ${params.id}:`, error);
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ message: error.message }, { status: 404 });
    }
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
