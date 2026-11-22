/**
 * Small in-process sliding-window rate limiter.
 *
 * Vercel runs several serverless instances, so this is a per-instance guard: it
 * stops casual abuse (form spam, passcode brute force, checkout flooding) but it
 * is not a distributed quota. Swap the store for Upstash/Redis if the shop ever
 * needs a global limit; the call sites do not change.
 */

interface WindowState {
  hits: number[];
}

const globalForRateLimit = globalThis as unknown as {
  __rkpRateLimit?: Map<string, WindowState>;
};

function buckets(): Map<string, WindowState> {
  if (!globalForRateLimit.__rkpRateLimit) {
    globalForRateLimit.__rkpRateLimit = new Map();
  }
  return globalForRateLimit.__rkpRateLimit;
}

export interface RateLimitOptions {
  /** Logical bucket name, e.g. "checkout" or "admin-login". */
  bucket: string;
  /** Allowed requests inside the window. */
  limit: number;
  /** Window length in milliseconds. */
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  limit: number;
}

/** Best-effort client identity; Vercel sets x-forwarded-for. */
export function getClientIp(headers: { get(name: string): string | null }): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  return headers.get('x-real-ip')?.trim() || 'unknown';
}

export function checkRateLimit(key: string, options: RateLimitOptions, now = Date.now()): RateLimitResult {
  if (process.env.RATE_LIMIT_DISABLED === '1') {
    return { allowed: true, remaining: options.limit, retryAfterSeconds: 0, limit: options.limit };
  }

  const store = buckets();
  const fullKey = `${options.bucket}:${key}`;
  const windowStart = now - options.windowMs;
  const state = store.get(fullKey) ?? { hits: [] };
  state.hits = state.hits.filter((timestamp) => timestamp > windowStart);

  if (state.hits.length >= options.limit) {
    const oldest = state.hits[0] ?? now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + options.windowMs - now) / 1000));
    store.set(fullKey, state);
    return { allowed: false, remaining: 0, retryAfterSeconds, limit: options.limit };
  }

  state.hits.push(now);
  store.set(fullKey, state);

  // Opportunistic cleanup so a long-lived instance does not grow forever.
  if (store.size > 5000) {
    store.forEach((value: WindowState, bucketKey: string) => {
      if (value.hits.every((timestamp: number) => timestamp <= windowStart)) store.delete(bucketKey);
    });
  }

  return {
    allowed: true,
    remaining: Math.max(0, options.limit - state.hits.length),
    retryAfterSeconds: 0,
    limit: options.limit,
  };
}

/** Convenience wrapper: rate limit by bucket + client IP. */
export function checkRequestRateLimit(
  headers: { get(name: string): string | null },
  options: RateLimitOptions,
  identity?: string
): RateLimitResult {
  return checkRateLimit(identity || getClientIp(headers), options);
}

export const RATE_LIMITS = {
  checkout: { bucket: 'checkout', limit: 8, windowMs: 60_000 },
  adminLogin: { bucket: 'admin-login', limit: 5, windowMs: 10 * 60_000 },
  trackOrder: { bucket: 'track-order', limit: 30, windowMs: 60_000 },
  contact: { bucket: 'contact', limit: 4, windowMs: 10 * 60_000 },
  customOrder: { bucket: 'custom-order', limit: 4, windowMs: 10 * 60_000 },
  reviews: { bucket: 'reviews', limit: 5, windowMs: 10 * 60_000 },
  newsletter: { bucket: 'newsletter', limit: 3, windowMs: 10 * 60_000 },
  analytics: { bucket: 'analytics', limit: 120, windowMs: 60_000 },
  abandonedCart: { bucket: 'abandoned-cart', limit: 12, windowMs: 10 * 60_000 },
} as const satisfies Record<string, RateLimitOptions>;
