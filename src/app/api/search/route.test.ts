import { NextRequest } from 'next/server';

import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { searchResponseSchema } from '@/lib/schemas/search';
import { server } from '@/tests/msw';

import { GET } from './route';

const request = (qs: string) => new NextRequest(`http://localhost/api/search?${qs}`);

describe('GET /api/search', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should return shaped, cacheable results for a query', async () => {
    const res = await GET(request('q=London'));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400');
    const body = searchResponseSchema.parse(await res.json());
    expect(body.results[0].label).toBe('London, England, United Kingdom');
  });

  it('should reject an empty query with 400', async () => {
    const res = await GET(request('q='));
    expect(res.status).toBe(400);
  });

  it('should fall back to Nominatim when Open-Meteo has no match (e.g. a postcode)', async () => {
    // Open-Meteo finds nothing for a postcode.
    server.use(
      http.get('https://geocoding-api.open-meteo.com/v1/search', () =>
        HttpResponse.json({ results: [] })
      )
    );

    const res = await GET(request('q=SW1A%201AA'));
    expect(res.status).toBe(200);
    const body = searchResponseSchema.parse(await res.json());
    expect(body.results[0].name).toBe('London');
    expect(body.results[0].label).toContain('SW1A 1AA');
  });
});
