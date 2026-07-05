import { describe, expect, it } from 'vitest';

import { conditionFamily, iconSrc, ogGradient, resolveCondition } from './weather-codes';

describe('weather-codes', () => {
  it('should map known WMO codes to a description and icon', () => {
    expect(resolveCondition(0)).toEqual({
      description: 'Clear sky',
      icon: 'clear'
    });
    expect(resolveCondition(2).icon).toBe('partly-cloudy');
    expect(resolveCondition(61).icon).toBe('light-rain');
    expect(resolveCondition(75).icon).toBe('heavy-snowfall');
    expect(resolveCondition(99).icon).toBe('thunderstorm-with-hail');
  });

  it('should fall back for unknown codes', () => {
    expect(resolveCondition(1234)).toEqual({
      description: 'Unknown',
      icon: 'overcast'
    });
  });

  it('should build the public path for an icon', () => {
    expect(iconSrc('clear')).toBe('/icons/clear@4x.png');
  });

  it('should map every WMO code to its condition family', () => {
    const expected: Record<number, string> = {
      0: 'clear',
      1: 'clear',
      2: 'partly-cloudy',
      3: 'overcast',
      45: 'fog',
      48: 'fog',
      51: 'drizzle',
      53: 'drizzle',
      55: 'drizzle',
      56: 'drizzle',
      57: 'drizzle',
      61: 'rain',
      63: 'rain',
      65: 'rain',
      66: 'rain',
      67: 'rain',
      80: 'rain',
      81: 'rain',
      82: 'rain',
      71: 'snow',
      73: 'snow',
      75: 'snow',
      77: 'snow',
      85: 'snow',
      86: 'snow',
      95: 'thunder',
      96: 'thunder',
      99: 'thunder'
    };
    for (const [code, family] of Object.entries(expected)) {
      expect(conditionFamily(Number(code))).toBe(family);
    }
  });

  it('should fall back to overcast for an unknown condition family', () => {
    expect(conditionFamily(1234)).toBe('overcast');
  });

  it('should return a day and night gradient string for every family', () => {
    const families = [
      'clear',
      'partly-cloudy',
      'overcast',
      'fog',
      'drizzle',
      'rain',
      'snow',
      'thunder'
    ] as const;
    for (const family of families) {
      expect(ogGradient(family, true)).toMatch(/^linear-gradient\(/);
      expect(ogGradient(family, false)).toMatch(/^linear-gradient\(/);
      expect(ogGradient(family, true)).not.toBe(ogGradient(family, false));
    }
  });
});
