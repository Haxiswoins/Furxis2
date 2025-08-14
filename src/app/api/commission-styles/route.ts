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
