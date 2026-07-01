import { NextRequest } from 'next/server';

import { describe, expect, test } from 'vitest';

import { GET } from './route';

const request = (qs: string) => new NextRequest(`http://localhost/api/reverse?${qs}`);

describe('GET /api/reverse', () => {
  test('should return the resolved city label for valid coordinates', async () => {
    const res = await GET(request('lat=51.5&lon=-0.12'));

    expect(res.status).toBe(200);
    expect(res.headers.get('cache-control')).toContain('s-maxage=86400');
    const body = await res.json();
    expect(body.label).toBe('London');
  });

  test('should reject out-of-range coordinates with 400', async () => {
    const res = await GET(request('lat=999&lon=0'));
    expect(res.status).toBe(400);
  });
});
