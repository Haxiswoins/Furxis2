import { NextRequest, NextResponse } from 'next/server';
import { getContractsHandler, saveContractsHandler } from '@/lib/data-handler';
import type { Contracts } from '@/types';

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
