import { describe, expect, it } from 'vitest';

import { searchResponseSchema } from '@/lib/schemas/search';
import { weatherResponseSchema } from '@/lib/schemas/weather';
import { forecastFixture, geocodingFixture, nominatimSearchFixture } from '@/tests/fixtures';

import { nominatimToSearchResults, reverseToLabel, toSearchResults, toWeather } from './transform';

describe('transform', () => {
  it('should map a postcode result to the search contract', () => {
    const [result] = nominatimToSearchResults(nominatimSearchFixture);
    const parsed = searchResponseSchema.safeParse({ results: [result] });
    expect(parsed.success).toBe(true);
    expect(result.name).toBe('London');
    expect(result.label).toBe('London, SW1A 1AA, England, United Kingdom');
    expect(result.countryCode).toBe('GB');
    expect(result.latitude).toBeCloseTo(51.501, 3);
  });

  it('should fall back through address fields and display_name', () => {
    const results = nominatimToSearchResults([
      {
        place_id: 1,
        lat: '40.7',
        lon: '-74.0',
        display_name: '10001, New York, USA',
        address: { postcode: '10001', country: 'USA' }
      },
      { place_id: 2, lat: '1', lon: '2', display_name: 'Somewhere, Country' }
    ]);

    expect(results[0].name).toBe('10001');
    expect(results[0].countryCode).toBeUndefined();
    expect(results[1].name).toBe('Somewhere');
  });

  it('should prefer the most specific settlement name', () => {
    expect(reverseToLabel({ address: { city: 'London', county: 'Greater London' } })).toBe(
      'London'
    );
    expect(reverseToLabel({ address: { village: 'Grasmere' } })).toBe('Grasmere');
  });

  it('should fall back to the first part of display_name', () => {
    expect(reverseToLabel({ display_name: 'Somewhere, Region, Country', address: {} })).toBe(
      'Somewhere'
    );
  });

  it('should return an empty string when nothing is usable', () => {
    expect(reverseToLabel({})).toBe('');
  });

  it('should map results to the contract with a composed label', () => {
    const results = toSearchResults(geocodingFixture);

    expect(results).toHaveLength(1);
    expect(results[0]).toMatchObject({
      id: '2643743',
      label: 'London, England, United Kingdom',
      latitude: 51.50853
    });
    expect(() => searchResponseSchema.parse({ results })).not.toThrow();
  });

  it('should dedupe repeated parts in the label', () => {
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

  it('should return an empty list when upstream omits results', () => {
    expect(toSearchResults({})).toEqual([]);
  });

  it('should pivot columnar series into rows and conform to the contract', () => {
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

  it('should normalize is_day (0/1) to booleans and preserve nulls', () => {
    const out = toWeather(forecastFixture, { latitude: 51.5, longitude: -0.12 });

    expect(out.current.isDay).toBe(false);
    expect(out.hourly[0].isDay).toBe(false);
    expect(out.hourly[1].isDay).toBe(true);
    expect(out.hourly[1].precipitationProbability).toBeNull();
  });
});
