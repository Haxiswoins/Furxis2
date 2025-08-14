import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import type { SiteContent } from '@/types';

const jsonDirectory = path.join(process.cwd(), 'data');
const filePath = path.join(jsonDirectory, 'siteContent.json');

async function readData(): Promise<SiteContent> {
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
      const defaultContent: SiteContent = {
        commissionTitle: '委托申请',
        commissionDescription: '为您量身定制。',
        commissionImageUrl: 'https://placehold.co/600x800.png',
        adoptionTitle: '设定领养',
        adoptionDescription: '领养一个预先设计的角色。',
        adoptionImageUrl: 'https://placehold.co/600x800.png',
        adoptionPageDescription: '给这些预先设计的角色一个家。',
        commissionPageDescription: '选择一个基础套餐开始您的定制兽装之旅。',
        adminEmail: '',
        homeBackgroundImageUrl: null,
        sunriseHour: 6,
        sunsetHour: 18,
        contactInfo: '您好，若有任何需要，您可以通过邮箱haxiswoins@qq.com联系我们，我们将会在收到邮件后的第一时间回复您。'
      };
      await writeData(defaultContent);
      return defaultContent;
    }
    throw error;
  }
}

async function writeData(data: SiteContent): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export async function GET() {
  try {
    const data = await readData();
    return NextResponse.json(data);
  } catch (error) {
    console.error('[API/SITE-CONTENT/GET] Failed to read site content:', error);
    return NextResponse.json({ message: 'Error reading site content' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Here you might want to add validation with Zod
    await writeData(body);
    return NextResponse.json({ message: 'Content updated successfully' });
  } catch (error) {
    console.error('[API/SITE-CONTENT/POST] Failed to write site content:', error);
    return NextResponse.json({ message: 'Error writing site content' }, { status: 500 });
  }
}
