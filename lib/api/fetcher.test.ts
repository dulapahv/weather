import { afterEach, describe, expect, test, vi } from 'vitest';

import { fetcher } from './fetcher';

afterEach(() => vi.restoreAllMocks());

describe('fetcher', () => {
  test('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ ok: 1 }), { status: 200 }))
    );
    await expect(fetcher('/x')).resolves.toEqual({ ok: 1 });
  });

  test("throws with the BFF's error message on failure", async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(JSON.stringify({ error: { status: 400, message: 'Bad input' } }), {
            status: 400
          })
      )
    );
    await expect(fetcher('/x')).rejects.toThrow('Bad input');
  });
});
