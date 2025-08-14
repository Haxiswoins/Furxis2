import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import type { CommissionOption } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'commissionOptions.json');

async function getCommissionOptionsHandler(): Promise<CommissionOption[]> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function saveCommissionOptionHandler(data: Omit<CommissionOption, 'id'>, id?: string): Promise<CommissionOption> {
    const options = await getCommissionOptionsHandler();
    if (id) {
        const index = options.findIndex(o => o.id === id);
        if (index === -1) throw new Error('Commission option not found');
        const updatedOption = { ...options[index], ...data };
        options[index] = updatedOption;
        await fs.writeFile(filePath, JSON.stringify(options, null, 2), 'utf8');
        return updatedOption;
    } else {
        const newOption: CommissionOption = { id: `comm_${Date.now()}`, ...data };
        options.push(newOption);
        await fs.writeFile(filePath, JSON.stringify(options, null, 2), 'utf8');
        return newOption;
    }
}

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
