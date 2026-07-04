import { beforeEach, describe, expect, it } from 'vitest';

import { DEFAULT_UNITS, usePreferences } from '@/store/preferences';

import { importPreferencesFromText } from './preferences-io';

describe('importPreferencesFromText', () => {
  beforeEach(() => usePreferences.getState().resetDefaults());

  it('should apply valid exported preferences and return the theme', () => {
    const res = importPreferencesFromText(
      JSON.stringify({
        theme: 'dark',
        units: { ...DEFAULT_UNITS, temperature: 'fahrenheit' },
        locations: [
          {
            id: '1',
            name: 'London',
            label: 'London',
            latitude: 51.5,
            longitude: -0.1
          }
        ]
      })
    );

    expect(res.ok).toBe(true);
    expect(res.theme).toBe('dark');
    expect(usePreferences.getState().units.temperature).toBe('fahrenheit');
    expect(usePreferences.getState().locations).toHaveLength(1);
  });

  it('should accept the system theme', () => {
    const res = importPreferencesFromText(
      JSON.stringify({ theme: 'system', units: DEFAULT_UNITS, locations: [] })
    );
    expect(res.ok).toBe(true);
    expect(res.theme).toBe('system');
  });

  it('should reject malformed JSON without touching the store', () => {
    expect(importPreferencesFromText('{not json').ok).toBe(false);
    expect(usePreferences.getState().locations).toEqual([]);
  });

  it('should reject invalid unit values', () => {
    const res = importPreferencesFromText(
      JSON.stringify({
        units: { ...DEFAULT_UNITS, temperature: 'kelvin' },
        locations: []
      })
    );
    expect(res.ok).toBe(false);
  });
});
