'use client';

import useSWR from 'swr';

import type { WeatherResponse } from '@/lib/schemas/weather';
import type { Units } from '@/store/preferences';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Only the units Open-Meteo actually applies go in the key. Distance/pressure are
// converted client-side, so changing them reformats without a refetch.
export function buildWeatherKey(coords: Coordinates, units: Units): string {
  const params = new URLSearchParams({
    latitude: String(coords.latitude),
    longitude: String(coords.longitude),
    temperatureUnit: units.temperature,
    windSpeedUnit: units.windSpeed,
    precipitationUnit: units.precipitation
  });
  return `/api/weather?${params.toString()}`;
}

export function useWeather(
  coords: Coordinates | null,
  units: Units,
  fallbackData?: WeatherResponse
) {
  const key = coords ? buildWeatherKey(coords, units) : null;
  const { data, error, isLoading } = useSWR<WeatherResponse>(key, {
    refreshInterval: 300_000, // 5-minute polling
    fallbackData,
    keepPreviousData: true
  });
  return { weather: data, error: error as Error | undefined, isLoading };
}
