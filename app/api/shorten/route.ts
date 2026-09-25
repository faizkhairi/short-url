import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { createShortCode, isSafeDestination, isValidCode } from '@/lib/utils';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`shorten:${getClientIp(request)}`);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: 'Too many links created. Please try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rateLimit.retryAfterSeconds) } }
    );
  }

  try {
    const body = await request.json();
    const { url, customCode } = body as { url: string; customCode?: string };

    if (!url || !isSafeDestination(url)) {
      return NextResponse.json(
        { error: 'Please provide a valid, publicly reachable URL (http or https)' },
        { status: 400 }
      );
    }

    let code: string;

    if (customCode) {
      if (!isValidCode(customCode)) {
        return NextResponse.json(
          { error: 'Custom code must be 3-20 alphanumeric characters' },
          { status: 400 }
        );
      }

      const existing = await prisma.url.findUnique({ where: { code: customCode } });
      if (existing) {
        return NextResponse.json(
          { error: 'This custom code is already taken' },
          { status: 409 }
        );
      }
      code = customCode;
    } else {
      code = createShortCode();
    }

    const shortened = await prisma.url.create({
      data: { code, original: url },
    });

    return NextResponse.json(shortened, { status: 201 });
  } catch (error) {
    console.error('Shorten error:', error);
    return NextResponse.json(
      { error: 'Failed to create short URL' },
      { status: 500 }
    );
  }
}
