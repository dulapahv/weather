import { describe, expect, test } from 'vitest';

import {
  convertDistance,
  convertPressure,
  formatDistance,
  formatPercent,
  formatPressure,
  formatTemperature,
  formatUvIndex,
  formatWind
} from './units';

describe('convertPressure', () => {
  test('should treat hPa as the identity unit', () => {
    expect(convertPressure(1013, 'hpa')).toBe(1013);
  });
  test('should convert hPa to inHg', () => {
    expect(convertPressure(1013, 'inhg')).toBeCloseTo(29.91, 2);
  });
  test('should convert hPa to mmHg', () => {
    expect(convertPressure(1013, 'mmhg')).toBeCloseTo(759.81, 1);
  });
});

describe('convertDistance', () => {
  test('should convert meters to km', () => {
    expect(convertDistance(10000, 'km')).toBe(10);
  });
  test('should convert meters to miles', () => {
    expect(convertDistance(1609.344, 'mi')).toBeCloseTo(1, 5);
  });
});

describe('formatters', () => {
  test('should round and append a degree sign', () => {
    expect(formatTemperature(24.6)).toBe('25°');
  });
  test('should round a negative temperature toward zero', () => {
    expect(formatTemperature(-0.4)).toBe('0°');
  });
  test('should round and label wind for the selected unit', () => {
    expect(formatWind(13.7, 'kmh')).toBe('14 km/h');
    expect(formatWind(5, 'ms')).toBe('5 m/s');
  });
  test('should convert, round, and label pressure', () => {
    expect(formatPressure(1013, 'hpa')).toBe('1,013 hPa'); // grouped thousands
    expect(formatPressure(1013, 'inhg')).toBe('29.91 inHg');
  });
  test('should convert and label distance', () => {
    expect(formatDistance(10000, 'km')).toBe('10 km');
    expect(formatDistance(10000, 'mi')).toBe('6.2 mi');
  });
  test('should append a percent sign', () => {
    expect(formatPercent(64)).toBe('64%');
  });
  test('should append the UV exposure category', () => {
    expect(formatUvIndex(0)).toBe('0 · Low');
    expect(formatUvIndex(4)).toBe('4 · Moderate');
    expect(formatUvIndex(6.6)).toBe('7 · High');
    expect(formatUvIndex(9)).toBe('9 · Very high');
    expect(formatUvIndex(11)).toBe('11 · Extreme');
  });
});
