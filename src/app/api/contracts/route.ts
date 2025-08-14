import { NextRequest, NextResponse } from 'next/server';
import type { Contracts } from '@/types';
import path from 'path';
import { promises as fs } from 'fs';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'contracts.json');

async function getContractsHandler(): Promise<Contracts> {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
}

async function saveContractsHandler(data: Contracts): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}


export async function GET() {
  try {
    const data = await getContractsHandler();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/CONTRACTS/GET] Failed to read contracts:', error);
    return NextResponse.json({ message: 'Error reading contracts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: Contracts = await req.json();
    await saveContractsHandler(body);
    return NextResponse.json({ message: 'Contracts updated successfully' });
  } catch (error) {
    console.error('[API/CONTRACTS/POST] Failed to write contracts:', error);
    return NextResponse.json({ message: 'Error writing contracts' }, { status: 500 });
  }
}
