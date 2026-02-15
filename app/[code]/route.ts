import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { UAParser } from 'ua-parser-js';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;

  try {
    const url = await prisma.url.findUnique({ where: { code } });

    if (!url || !url.active) {
      return NextResponse.redirect(new URL('/?error=not-found', request.url));
    }

    // Fire-and-forget click tracking — don't block the redirect
    trackClick(url.id, request).catch(() => {});

    return NextResponse.redirect(url.original, { status: 302 });
  } catch {
    return NextResponse.redirect(new URL('/', request.url));
  }
}

async function trackClick(urlId: string, request: NextRequest) {
  const ua = new UAParser(request.headers.get('user-agent') || '');
  const device = ua.getDevice();
  const browser = ua.getBrowser();
  const os = ua.getOS();

  // Vercel provides geo headers automatically
  const country = request.headers.get('x-vercel-ip-country') || null;
  const city = request.headers.get('x-vercel-ip-city') || null;
  const referrer = request.headers.get('referer') || null;

  await prisma.click.create({
    data: {
      urlId,
      country,
      city,
      device: device.type || 'desktop',
      browser: browser.name || null,
      os: os.name || null,
      referrer,
    },
  });
}
