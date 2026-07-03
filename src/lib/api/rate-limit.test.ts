import { describe, expect, it } from 'vitest';

import { rateLimit } from './rate-limit';

describe('rateLimit', () => {
  it('allows up to the limit, then blocks within the window', () => {
    const key = `test-${Math.random()}`;

    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(true);
    expect(rateLimit(key, 2, 60_000).ok).toBe(false);
  });

  it('reports remaining quota', () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 3, 60_000).remaining).toBe(2);
    expect(rateLimit(key, 3, 60_000).remaining).toBe(1);
  });
});
