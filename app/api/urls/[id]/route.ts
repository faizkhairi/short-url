import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getClickStats } from '@/lib/analytics';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = await prisma.url.findUnique({ where: { id } });

    if (!url) {
      return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    const stats = await getClickStats(id);
    return NextResponse.json({ url, stats });
  } catch (error) {
    console.error('Get URL analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const url = await prisma.url.update({
      where: { id },
      data: { active: body.active },
    });

    return NextResponse.json(url);
  } catch (error) {
    console.error('Update URL error:', error);
    return NextResponse.json(
      { error: 'Failed to update URL' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.url.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete URL error:', error);
    return NextResponse.json(
      { error: 'Failed to delete URL' },
      { status: 500 }
    );
  }
}
