import type { NextRequest } from 'next/server';

import {
  errorResponse,
  handleRouteError,
  jsonResponse,
  SEARCH_CACHE_CONTROL
} from '@/lib/api/http';
import { fetchReverseGeocoding } from '@/lib/api/provider';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';
import { reverseToLabel } from '@/lib/api/transform';
import { reverseQuerySchema } from '@/lib/schemas/reverse';

export const GET = async (request: NextRequest) => {
  if (!rateLimit(`reverse:${clientKey(request)}`).ok) {
    return errorResponse(429, 'Too many requests. Please slow down and try again.');
  }

  const parsed = reverseQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request.');
  }

  try {
    const upstream = await fetchReverseGeocoding(parsed.data);
    return jsonResponse({ label: reverseToLabel(upstream) }, { cache: SEARCH_CACHE_CONTROL });
  } catch (error) {
    return handleRouteError(error);
  }
};
