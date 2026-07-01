import { NextRequest } from 'next/server';

import { http, HttpResponse } from 'msw';
import { describe, expect, test } from 'vitest';

import { server } from '@/tests/msw';

import { GET } from './route';

const request = (qs: string) => new NextRequest(`http://localhost/api/search?${qs}`);

describe('GET /api/search', () => {
  test('should return shaped, cacheable results for a query', async () => {
    const res = await GET(request('q=London'));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400');
    const body = await res.json();
    expect(body.results[0].label).toBe('London, England, United Kingdom');
  });

  test('should reject an empty query with 400', async () => {
    const res = await GET(request('q='));
    expect(res.status).toBe(400);
  });

  test('should fall back to Nominatim when Open-Meteo has no match (e.g. a postcode)', async () => {
    // Open-Meteo finds nothing for a postcode.
    server.use(
      http.get('https://geocoding-api.open-meteo.com/v1/search', () =>
        HttpResponse.json({ results: [] })
      )
    );

    const res = await GET(request('q=SW1A%201AA'));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.results[0].name).toBe('London');
    expect(body.results[0].label).toContain('SW1A 1AA');
  });
});
