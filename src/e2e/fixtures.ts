import { toSearchResults, toWeather } from '@/lib/api/transform';
import { forecastFixture, geocodingFixture } from '@/tests/fixtures';

export const weatherResponse = toWeather(forecastFixture, {
  latitude: 13.7563,
  longitude: 100.5018
});

export const searchResponse = { results: toSearchResults(geocodingFixture) };

export const geoResponse = {
  latitude: 13.7563,
  longitude: 100.5018,
  label: 'Bangkok',
  source: 'ip' as const
};

export const reverseResponse = { label: 'Bangkok' };
