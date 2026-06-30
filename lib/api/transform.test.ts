import { describe, expect, test } from 'vitest';

import { searchResponseSchema } from '@/lib/schemas/search';
import { weatherResponseSchema } from '@/lib/schemas/weather';
import { forecastFixture, geocodingFixture, nominatimSearchFixture } from '@/tests/fixtures';

import { nominatimToSearchResults, reverseToLabel, toSearchResults, toWeather } from './transform';

describe('nominatimToSearchResults', () => {
  test('maps a postcode result to the search contract', () => {
    const [result] = nominatimToSearchResults(nominatimSearchFixture);
    const parsed = searchResponseSchema.safeParse({ results: [result] });
    expect(parsed.success).toBe(true);
    expect(result.name).toBe('London');
    expect(result.label).toBe('London, SW1A 1AA, England, United Kingdom');
    expect(result.countryCode).toBe('GB');
    expect(result.latitude).toBeCloseTo(51.501, 3);
  });
});

describe('reverseToLabel', () => {
  test('prefers the most specific settlement name', () => {
    expect(reverseToLabel({ address: { city: 'London', county: 'Greater London' } })).toBe(
      'London'
    );
    expect(reverseToLabel({ address: { village: 'Grasmere' } })).toBe('Grasmere');
  });

  test('falls back to the first part of display_name', () => {
    expect(reverseToLabel({ display_name: 'Somewhere, Region, Country', address: {} })).toBe(
      'Somewhere'
    );
  });

  test('returns an empty string when nothing is usable', () => {
    expect(reverseToLabel({})).toBe('');
  });
});

describe('toSearchResults', () => {
  test('maps results to the contract with a composed label', () => {
    const results = toSearchResults(geocodingFixture);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: '2643743',
      label: 'London, England, United Kingdom',
      latitude: 51.50853
    });
    expect(() => searchResponseSchema.parse({ results })).not.toThrow();
  });

  test('dedupes repeated parts in the label', () => {
    const out = toSearchResults({
      results: [
        {
          id: 1,
          name: 'Tokyo',
          latitude: 35.6,
          longitude: 139.7,
          admin1: 'Tokyo',
          country: 'Japan'
        }
      ]
    });
    expect(out[0].label).toBe('Tokyo, Japan');
  });

  test('returns an empty list when upstream omits results', () => {
    expect(toSearchResults({})).toEqual([]);
  });
});

describe('toWeather', () => {
  test('pivots columnar series into rows and conforms to the contract', () => {
    const out = toWeather(forecastFixture, { latitude: 51.5, longitude: -0.12 });

    expect(out.location).toMatchObject({
      latitude: 51.5,
      longitude: -0.12,
      timezone: 'Europe/London'
    });
    expect(out.units.temperature).toBe('°C');
    expect(out.hourly).toHaveLength(2);
    expect(out.daily).toHaveLength(1);
    expect(out.daily[0].temperatureMax).toBe(32.6);
    expect(() => weatherResponseSchema.parse(out)).not.toThrow();
  });

  test('normalises is_day (0/1) to booleans and preserves nulls', () => {
    const out = toWeather(forecastFixture, { latitude: 51.5, longitude: -0.12 });

    expect(out.current.isDay).toBe(false);
    expect(out.hourly[0].isDay).toBe(false);
    expect(out.hourly[1].isDay).toBe(true);
    expect(out.hourly[1].precipitationProbability).toBeNull();
  });
});
