import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { checkRateLimit, resetRateLimit, getClientIp } from '@/lib/rate-limit';

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetRateLimit();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('allows requests up to the configured max within the window', () => {
    for (let i = 0; i < 10; i++) {
      const result = checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 });
      expect(result.allowed).toBe(true);
    }
  });

  it('blocks the request once the max is exceeded within the window', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 });
    }
    const blocked = checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 });
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it('tracks separate keys independently', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 });
    }
    const otherIp = checkRateLimit('ip:2.2.2.2', { windowMs: 60_000, max: 10 });
    expect(otherIp.allowed).toBe(true);
  });

  it('allows requests again once the window has fully elapsed', () => {
    for (let i = 0; i < 10; i++) {
      checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 });
    }
    expect(checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 }).allowed).toBe(false);

    vi.advanceTimersByTime(60_001);

    expect(checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 10 }).allowed).toBe(true);
  });

  it('is a sliding window, not a fixed one: old hits age out independently', () => {
    checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 2 }); // t=0
    vi.advanceTimersByTime(59_000);
    checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 2 }); // t=59s, still within window of first hit

    // Both hits are within the window; a third should be blocked.
    expect(checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 2 }).allowed).toBe(false);

    // Advance past the first hit's expiry (t=60s+) but not the second's.
    vi.advanceTimersByTime(2_000); // now t=61s; first hit (t=0) has aged out
    expect(checkRateLimit('ip:1.1.1.1', { windowMs: 60_000, max: 2 }).allowed).toBe(true);
  });
});

describe('getClientIp', () => {
  it('uses the first hop of x-forwarded-for', () => {
    const request = new Request('http://example.com', {
      headers: { 'x-forwarded-for': '203.0.113.5, 10.0.0.1' },
    });
    expect(getClientIp(request)).toBe('203.0.113.5');
  });

  it('falls back to "unknown" when the header is absent', () => {
    const request = new Request('http://example.com');
    expect(getClientIp(request)).toBe('unknown');
  });
});
