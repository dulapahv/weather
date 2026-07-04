import type { NextRequest } from 'next/server';

import { getRateLimitStore } from '@/lib/api/bindings';
import {
  errorResponse,
  handleRouteError,
  jsonResponse,
  WEATHER_CACHE_CONTROL
} from '@/lib/api/http';
import { fetchForecast } from '@/lib/api/provider';
import { clientKey, rateLimit } from '@/lib/api/rate-limit';
import { toWeather } from '@/lib/api/transform';
import { weatherQuerySchema } from '@/lib/schemas/weather';

export const GET = async (request: NextRequest) => {
  const limit = await rateLimit(getRateLimitStore(), `weather:${clientKey(request)}`);
  if (!limit.ok) {
    return errorResponse(429, 'Too many requests. Please slow down and try again.');
  }

  const parsed = weatherQuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return errorResponse(400, parsed.error.issues[0]?.message ?? 'Invalid request.');
  }

  try {
    const upstream = await fetchForecast(parsed.data);
    return jsonResponse(toWeather(upstream, parsed.data), {
      cache: WEATHER_CACHE_CONTROL
    });
  } catch (error) {
    return handleRouteError(error);
  }
};
