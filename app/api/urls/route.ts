import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const urls = await prisma.url.findMany({
      include: { _count: { select: { clicks: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(urls);
  } catch (error) {
    console.error('List URLs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch URLs' },
      { status: 500 }
    );
  }
}
