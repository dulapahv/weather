export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

export interface RateLimitStore {
  get(key: string): Promise<string | null>;
  put(key: string, value: string, options?: { expirationTtl?: number }): Promise<void>;
}

type Bucket = { count: number; resetAt: number };
const memoryBuckets = new Map<string, Bucket>();

const memoryLimit = (key: string, limit: number, windowMs: number): RateLimitResult => {
  const now = Date.now();
  const bucket = memoryBuckets.get(key);
  if (!bucket || now > bucket.resetAt) {
    const resetAt = now + windowMs;
    memoryBuckets.set(key, { count: 1, resetAt });
    return { ok: true, remaining: limit - 1, resetAt };
  }
  bucket.count += 1;
  return {
    ok: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetAt: bucket.resetAt
  };
};

export const rateLimit = async (
  store: RateLimitStore | undefined,
  key: string,
  limit = 60,
  windowMs = 60_000
): Promise<RateLimitResult> => {
  if (!store) return memoryLimit(key, limit, windowMs);

  const window = Math.floor(Date.now() / windowMs);
  const resetAt = (window + 1) * windowMs;
  const bucketKey = `${key}:${window}`;

  try {
    const count = Number(await store.get(bucketKey)) || 0;
    if (count >= limit) return { ok: false, remaining: 0, resetAt };
    await store.put(bucketKey, String(count + 1), {
      expirationTtl: Math.max(60, Math.ceil(windowMs / 1000))
    });
    return { ok: true, remaining: limit - count - 1, resetAt };
  } catch {
    // If the KV store is unavailable, fall back to in-memory rate limiting.
    return memoryLimit(key, limit, windowMs);
  }
};

// Cloudflare populates CF-Connecting-IP; x-forwarded-for is the dev fallback.
export const clientKey = (request: Request): string => {
  return (
    request.headers.get('cf-connecting-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    'unknown'
  );
};
