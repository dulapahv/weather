import { describe, expect, it } from 'vitest';

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

describe('units', () => {
  it('should treat hPa as the identity pressure unit', () => {
    expect(convertPressure(1013, 'hpa')).toBe(1013);
  });

  it('should convert hPa to inHg', () => {
    expect(convertPressure(1013, 'inhg')).toBeCloseTo(29.91, 2);
  });

  it('should convert hPa to mmHg', () => {
    expect(convertPressure(1013, 'mmhg')).toBeCloseTo(759.81, 1);
  });

  it('should convert meters to km', () => {
    expect(convertDistance(10000, 'km')).toBe(10);
  });

  it('should convert meters to miles', () => {
    expect(convertDistance(1609.344, 'mi')).toBeCloseTo(1, 5);
  });

  it('should round and append a degree sign', () => {
    expect(formatTemperature(24.6)).toBe('25°');
  });

  it('should round a negative temperature toward zero', () => {
    expect(formatTemperature(-0.4)).toBe('0°');
  });

  it('should round and label wind for the selected unit', () => {
    expect(formatWind(13.7, 'kmh')).toBe('14 km/h');
    expect(formatWind(5, 'ms')).toBe('5 m/s');
  });

  it('should convert, round, and label pressure', () => {
    expect(formatPressure(1013, 'hpa')).toBe('1,013 hPa');
    expect(formatPressure(1013, 'inhg')).toBe('29.91 inHg');
  });

  it('should convert and label distance', () => {
    expect(formatDistance(10000, 'km')).toBe('10 km');
    expect(formatDistance(10000, 'mi')).toBe('6.2 mi');
  });

  it('should append a percent sign', () => {
    expect(formatPercent(64)).toBe('64%');
  });

  it('should append the UV exposure category', () => {
    expect(formatUvIndex(0)).toBe('0 · Low');
    expect(formatUvIndex(4)).toBe('4 · Moderate');
    expect(formatUvIndex(6.6)).toBe('7 · High');
    expect(formatUvIndex(9)).toBe('9 · Very high');
    expect(formatUvIndex(11)).toBe('11 · Extreme');
  });
});
