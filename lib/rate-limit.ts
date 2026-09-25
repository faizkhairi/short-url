/**
 * In-memory, per-key sliding-window rate limiter.
 *
 * This is best-effort: state lives in the Node process's memory, so on
 * Vercel it is scoped to a single warm serverless function instance, not
 * shared across concurrent instances, regions, or deployments. It still
 * throttles bursts against any one instance, but it is not a global cap;
 * a determined caller spread across many cold starts can exceed it.
 */

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
}

interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds: number;
}

const DEFAULT_WINDOW_MS = 60_000;
const DEFAULT_MAX = 10;

const hitsByKey = new Map<string, number[]>();

export function checkRateLimit(key: string, options: RateLimitOptions = {}): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const max = options.max ?? DEFAULT_MAX;
  const now = Date.now();

  const recent = (hitsByKey.get(key) ?? []).filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= max) {
    hitsByKey.set(key, recent);
    const retryAfterMs = windowMs - (now - recent[0]);
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
  }

  recent.push(now);
  hitsByKey.set(key, recent);
  return { allowed: true, retryAfterSeconds: 0 };
}

/** Exposed for tests only, so each test can start with a clean limiter. */
export function resetRateLimit(): void {
  hitsByKey.clear();
}

export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return 'unknown';
}
