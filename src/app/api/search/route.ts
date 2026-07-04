import type { NextRequest } from 'next/server';

import { getRateLimitStore } from '@/lib/api/bindings';
import {
  errorResponse,
  handleRouteError,
  jsonResponse,
  SEARCH_CACHE_CONTROL
} from '@/lib/api/http';
import { fetchGeocoding, fetchNominatimSearch } from '@/lib/api/provider';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';
import { nominatimToSearchResults, toSearchResults } from '@/lib/api/transform';
import { searchQuerySchema } from '@/lib/schemas/search';

export const GET = async (request: NextRequest) => {
  const limit = await rateLimit(getRateLimitStore(), `search:${clientKey(request)}`);
  if (!limit.ok) {
    return errorResponse(429, 'Too many requests. Please slow down and try again.');
  }

  const parsed = searchQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request.');
  }

  try {
    const upstream = await fetchGeocoding(parsed.data);
    let results = toSearchResults(upstream);

    // Open-Meteo's geocoder is place-name based, so it misses postcodes. Fall back to
    // Nominatim (which resolves them) only when there's nothing to show.
    if (results.length === 0) {
      const places = await fetchNominatimSearch(parsed.data);
      results = nominatimToSearchResults(places);
    }

    return jsonResponse({ results }, { cache: SEARCH_CACHE_CONTROL });
  } catch (error) {
    return handleRouteError(error);
  }
};
