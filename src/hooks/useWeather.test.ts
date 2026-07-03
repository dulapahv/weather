import { describe, expect, it } from 'vitest';

import { DEFAULT_UNITS } from '@/store/preferences';

import { buildWeatherKey } from './useWeather';

describe('buildWeatherKey', () => {
  it('should encode coordinates and the units that affect the upstream query', () => {
    const key = buildWeatherKey({ latitude: 51.5, longitude: -0.12 }, DEFAULT_UNITS);
    expect(key).toContain('latitude=51.5');
    expect(key).toContain('longitude=-0.12');
    expect(key).toContain('temperatureUnit=celsius');
    expect(key).toContain('windSpeedUnit=kmh');
    expect(key).toContain('precipitationUnit=mm');
  });

  it('should omit client-only units so changing them does not refetch', () => {
    const key = buildWeatherKey({ latitude: 1, longitude: 2 }, DEFAULT_UNITS);
    expect(key).not.toContain('distance');
    expect(key).not.toContain('pressure');
  });
});
