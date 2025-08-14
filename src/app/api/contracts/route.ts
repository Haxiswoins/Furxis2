import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { Contracts } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'contracts.json');

const defaultContracts: Contracts = {
    commissionContract: "请在后台合同管理页面填写您的委托合同。",
    adoptionContract: "请在后台合同管理页面填写您的领养合同。",
    commissionConfirmationEmail: "恭喜！您的前行无界 {productName} 委托申请已中标！请您及时前往工作室官网 -> 右上角个人信息图标 -> 我的订单 -> 订单详情页面阅读服务条款并确认委托申请。"
};

async function readData(): Promise<Contracts> {
    try {
        const fileContents = await fs.readFile(filePath, 'utf8');
        return JSON.parse(fileContents);
    } catch (error) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            await writeData(defaultContracts);
            return defaultContracts;
        }
        throw error;
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
