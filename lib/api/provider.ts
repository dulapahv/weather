import 'server-only';

import type { z } from 'zod';

import { nominatimReverseSchema, type ReverseQuery } from '@/lib/schemas/reverse';
import { geocodingResponseSchema, nominatimSearchSchema } from '@/lib/schemas/search';
import { upstreamForecastSchema, type WeatherQuery } from '@/lib/schemas/weather';

import { UpstreamError } from './errors';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
// Nominatim requires a valid User-Agent header for identification, and the usage policy forbids heavy traffic.
// See https://operations.osmfoundation.org/policies/nominatim/
const NOMINATIM_USER_AGENT = 'weather/1.0 (https://github.com/dulapahv/weather)';

const UPSTREAM_TIMEOUT_MS = 8000;

const CURRENT_FIELDS = [
  'temperature_2m',
  'relative_humidity_2m',
  'apparent_temperature',
  'is_day',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'surface_pressure',
  'visibility',
  'uv_index'
] as const;

const HOURLY_FIELDS = [
  'temperature_2m',
  'apparent_temperature',
  'weather_code',
  'is_day',
  'precipitation_probability'
] as const;

const DAILY_FIELDS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'sunrise',
  'sunset',
  'uv_index_max',
  'precipitation_probability_max',
  'wind_speed_10m_max'
] as const;

async function getJson(url: string, headers?: HeadersInit): Promise<unknown> {
  let res: Response;
  try {
    res = await fetch(url, {
      headers,
      signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS)
    });
  } catch {
    throw new UpstreamError(504, 'Upstream request timed out or failed.');
  }
  if (!res.ok) {
    throw new UpstreamError(502, `Upstream responded with ${res.status}.`);
  }
  return res.json();
}

function parseUpstream<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new UpstreamError(502, 'Upstream response failed validation.');
  }
  return result.data;
}

export async function fetchGeocoding(params: { q: string; count: number }) {
  const url = new URL(GEOCODING_URL);
  url.searchParams.set('name', params.q);
  url.searchParams.set('count', String(params.count));
  url.searchParams.set('language', 'en');
  url.searchParams.set('format', 'json');
  return parseUpstream(geocodingResponseSchema, await getJson(url.toString()));
}

export async function fetchForecast(params: WeatherQuery) {
  const url = new URL(FORECAST_URL);
  url.searchParams.set('latitude', String(params.latitude));
  url.searchParams.set('longitude', String(params.longitude));
  url.searchParams.set('timezone', 'auto'); // location-local times (FR-024)
  url.searchParams.set('forecast_days', '10');
  url.searchParams.set('temperature_unit', params.temperatureUnit);
  url.searchParams.set('wind_speed_unit', params.windSpeedUnit);
  url.searchParams.set('precipitation_unit', params.precipitationUnit);
  url.searchParams.set('current', CURRENT_FIELDS.join(','));
  url.searchParams.set('hourly', HOURLY_FIELDS.join(','));
  url.searchParams.set('daily', DAILY_FIELDS.join(','));
  return parseUpstream(upstreamForecastSchema, await getJson(url.toString()));
}

// Fallback geocoder (postcodes etc.). Same Nominatim usage policy as reverse.
export async function fetchNominatimSearch(params: { q: string; count: number }) {
  const url = new URL(NOMINATIM_SEARCH_URL);
  url.searchParams.set('q', params.q);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'en');
  url.searchParams.set('limit', String(params.count));
  return parseUpstream(
    nominatimSearchSchema,
    await getJson(url.toString(), { 'User-Agent': NOMINATIM_USER_AGENT })
  );
}

export async function fetchReverseGeocoding(params: ReverseQuery) {
  const url = new URL(NOMINATIM_REVERSE_URL);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('lat', String(params.lat));
  url.searchParams.set('lon', String(params.lon));
  url.searchParams.set('zoom', '10'); // city-level detail (FR-023)
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('accept-language', 'en'); // English place names, not local script
  return parseUpstream(
    nominatimReverseSchema,
    await getJson(url.toString(), { 'User-Agent': NOMINATIM_USER_AGENT })
  );
}
