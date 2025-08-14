import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Contracts } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'contracts.json');

async function readData(): Promise<Contracts> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error reading or parsing contracts.json:`, error);
    return {
        commissionContract: "",
        adoptionContract: "",
        commissionConfirmationEmail: "",
    };
  }
}

async function writeData(data: Contracts): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/CONTRACTS/GET] Failed to read contracts:', error);
    return NextResponse.json({ message: 'Error reading contracts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Contracts = await req.json();
    await writeData(body);
    return NextResponse.json({ message: 'Contracts updated successfully' });
  } catch (error) {
    console.error('[API/CONTRACTS/POST] Failed to write contracts:', error);
    return NextResponse.json({ message: 'Error writing contracts' }, { status: 500 });
  }
}
