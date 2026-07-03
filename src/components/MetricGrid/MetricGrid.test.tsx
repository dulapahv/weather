import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import { DEFAULT_UNITS } from '@/store/preferences';
import { forecastFixture } from '@/tests/fixtures';

import { MetricGrid } from './MetricGrid';

const weather = toWeather(forecastFixture, { latitude: 51.5, longitude: 0 });

const valueFor = (label: string) => screen.getByText(label).nextElementSibling?.textContent;

describe('MetricGrid', () => {
  it('should render the full metric set with formatted, unit-aware values', () => {
    render(<MetricGrid weather={weather} units={DEFAULT_UNITS} />);

    expect(valueFor('Humidity')).toBe('64%');
    expect(valueFor('Wind')).toBe('14 km/h');
    expect(valueFor('Pressure')).toBe('1,015 hPa');
    expect(valueFor('Visibility')).toBe('37 km');
    expect(valueFor('UV index')).toBe('0 · Low');
  });

  it("should show sunrise and sunset in the location's local time", () => {
    render(<MetricGrid weather={weather} units={DEFAULT_UNITS} />);

    expect(valueFor('Sunrise')).toBe('4:44 AM');
    expect(valueFor('Sunset')).toBe('9:21 PM');
  });

  it('should omit sunrise/sunset when there is no daily data', () => {
    render(<MetricGrid weather={{ ...weather, daily: [] }} units={DEFAULT_UNITS} />);

    expect(screen.getByText('Wind')).toBeInTheDocument();
    expect(screen.queryByText('Sunrise')).toBeNull();
  });

  it('should honour the 24-hour clock preference', () => {
    render(<MetricGrid weather={weather} units={{ ...DEFAULT_UNITS, clock: '24h' }} />);

    expect(valueFor('Sunrise')).toBe('04:44');
    expect(valueFor('Sunset')).toBe('21:21');
  });
});
