import type { NextRequest } from 'next/server';

import {
  errorResponse,
  handleRouteError,
  jsonResponse,
  SEARCH_CACHE_CONTROL
} from '@/lib/api/http';
import { fetchGeocoding } from '@/lib/api/provider';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';
import { toSearchResults } from '@/lib/api/transform';
import { searchQuerySchema } from '@/lib/schemas/search';

export async function GET(request: NextRequest) {
  if (!rateLimit(`search:${clientKey(request)}`).ok) {
    return errorResponse(429, 'Too many requests. Please slow down and try again.');
  }

  const parsed = searchQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request.');
  }

  try {
    const upstream = await fetchGeocoding(parsed.data);
    return jsonResponse({ results: toSearchResults(upstream) }, { cache: SEARCH_CACHE_CONTROL });
  } catch (error) {
    return handleRouteError(error);
  }
}
