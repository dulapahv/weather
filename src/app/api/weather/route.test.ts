import { NextRequest } from 'next/server';

import { http, HttpResponse } from 'msw';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { weatherResponseSchema } from '@/lib/schemas/weather';
import { server } from '@/tests/msw';

import { GET } from './route';

const request = (qs: string) => new NextRequest(`http://localhost/api/weather?${qs}`);

describe('GET /api/weather', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it('should return shaped, cacheable weather for valid coordinates', async () => {
    const res = await GET(request('latitude=51.5&longitude=-0.12'));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=300');
    const body = weatherResponseSchema.parse(await res.json());
    expect(body.current.isDay).toBe(false);
    expect(body.daily).toHaveLength(1);
  });

  it('should reject out-of-range coordinates with 400', async () => {
    const res = await GET(request('latitude=999&longitude=0'));
    expect(res.status).toBe(400);
  });

  it('should surface a 502 when the upstream provider fails', async () => {
    server.use(
      http.get('https://api.open-meteo.com/v1/forecast', () =>
        HttpResponse.json({ error: true }, { status: 500 })
      )
    );
    const res = await GET(request('latitude=51.5&longitude=-0.12'));
    expect(res.status).toBe(502);
  });
});
