import { describe, expect, test } from 'vitest';

import { iconSrc, resolveCondition } from './weather-codes';

describe('resolveCondition', () => {
  test('should map known WMO codes to a description and icon', () => {
    expect(resolveCondition(0)).toEqual({
      description: 'Clear sky',
      icon: 'clear'
    });
    expect(resolveCondition(2).icon).toBe('partly-cloudy');
    expect(resolveCondition(61).icon).toBe('light-rain');
    expect(resolveCondition(75).icon).toBe('heavy-snowfall');
    expect(resolveCondition(99).icon).toBe('thunderstorm-with-hail');
  });

  test('should fall back for unknown codes', () => {
    expect(resolveCondition(1234)).toEqual({
      description: 'Unknown',
      icon: 'overcast'
    });
  });
});

describe('iconSrc', () => {
  test('should build the public path for an icon', () => {
    expect(iconSrc('clear')).toBe('/icons/clear@4x.png');
  });
});
