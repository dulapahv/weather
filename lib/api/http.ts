import { NextResponse } from 'next/server';

import { UpstreamError } from './errors';

// Response can be cached for 5 minutes, and stale responses can be served for up to 10 minutes while revalidating in the background.
export const WEATHER_CACHE_CONTROL = 'public, s-maxage=300, stale-while-revalidate=600';
// Response can be cached for 1 day, and stale responses can be served for up to 7 days while revalidating in the background.
export const SEARCH_CACHE_CONTROL = 'public, s-maxage=86400, stale-while-revalidate=604800';

type JsonInit = { status?: number; cache?: string };

export function jsonResponse<T>(data: T, init: JsonInit = {}) {
  const headers = new Headers();
  if (init.cache) headers.set('cache-control', init.cache);
  return NextResponse.json(data, { status: init.status, headers });
}

export function errorResponse(status: number, message: string) {
  return NextResponse.json({ error: { status, message } }, { status });
}

export function handleRouteError(error: unknown) {
  if (error instanceof UpstreamError) {
    return errorResponse(
      error.status,
      "We couldn't get the latest weather right now. Please try again shortly."
    );
  }
  console.error('Unhandled route error:', error);
  return errorResponse(500, 'Something went wrong. Please try again.');
}
