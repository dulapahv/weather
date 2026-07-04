import { describe, expect, it } from 'vitest';

import { rateLimit, type RateLimitStore } from './rate-limit';

const fakeStore = (): RateLimitStore => {
  const map = new Map<string, string>();
  return {
    get: async k => map.get(k) ?? null,
    put: async (k, v) => void map.set(k, v)
  };
};

describe('rateLimit', () => {
  it('should allow up to the limit, then block (in-memory fallback)', async () => {
    const key = `mem-${Math.random()}`;
    expect((await rateLimit(undefined, key, 2)).ok).toBe(true);
    expect((await rateLimit(undefined, key, 2)).ok).toBe(true);
    expect((await rateLimit(undefined, key, 2)).ok).toBe(false);
  });

  it('should count in the KV store and report remaining quota', async () => {
    const store = fakeStore();
    const key = `kv-${Math.random()}`;
    const first = await rateLimit(store, key, 3);
    const second = await rateLimit(store, key, 3);
    expect(first.remaining).toBe(2);
    expect(second.remaining).toBe(1);
    expect(second.ok).toBe(true);

    await rateLimit(store, key, 3);
    expect((await rateLimit(store, key, 3)).ok).toBe(false);
  });

  it('should fall open to the in-memory window when KV throws', async () => {
    const broken: RateLimitStore = {
      get: async () => {
        throw new Error('kv down');
      },
      put: async () => {}
    };
    expect((await rateLimit(broken, `broken-${Math.random()}`, 1)).ok).toBe(true);
  });
});
