import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import type { HourlyEntry, WeatherResponse } from '@/lib/schemas/weather';
import { DEFAULT_UNITS } from '@/store/preferences';
import { forecastFixture } from '@/tests/fixtures';

import { HourlyForecast, upcomingHours } from './HourlyForecast';

const hour = (time: string): HourlyEntry => ({
  time,
  temperature: 20,
  apparentTemperature: 20,
  weatherCode: 0,
  isDay: true,
  precipitationProbability: 0
});

describe('HourlyForecast', () => {
  const hours = [hour('2026-07-01T08:00'), hour('2026-07-01T09:00'), hour('2026-07-01T10:00')];

  it('should start at the current hour and keep the forward window', () => {
    const result = upcomingHours(hours, '2026-07-01T09:30', 24);
    expect(result.map(h => h.time)).toEqual(['2026-07-01T09:00', '2026-07-01T10:00']);
  });

  it('should cap the window to the requested count', () => {
    expect(upcomingHours(hours, '2026-07-01T08:00', 1)).toHaveLength(1);
  });

  it('should fall back to the start when every hour is in the past', () => {
    expect(upcomingHours(hours, '2026-07-01T23:00')).toHaveLength(3);
  });

  it("should label the current hour 'Now' and others by local time", () => {
    const base = toWeather(forecastFixture, { latitude: 51.5, longitude: 0 });
    const weather: WeatherResponse = {
      ...base,
      hourly: [hour('2026-07-01T21:00'), hour('2026-07-01T22:00')]
    };

    render(<HourlyForecast weather={weather} units={DEFAULT_UNITS} />);

    expect(screen.getByText('Hourly')).toBeInTheDocument();
    expect(screen.getByText('Now')).toBeInTheDocument(); // the 21:00 cell
    expect(screen.getByText('10 PM')).toBeInTheDocument(); // the 22:00 cell
    expect(screen.getAllByText('20°').length).toBeGreaterThan(0);
  });

  it('should render 24-hour labels when the clock preference is 24h', () => {
    const base = toWeather(forecastFixture, { latitude: 51.5, longitude: 0 });
    const weather: WeatherResponse = {
      ...base,
      hourly: [hour('2026-07-01T21:00'), hour('2026-07-01T22:00')]
    };

    render(<HourlyForecast weather={weather} units={{ ...DEFAULT_UNITS, clock: '24h' }} />);

    expect(screen.getByText('Now')).toBeInTheDocument();
    expect(screen.getByText('22')).toBeInTheDocument();
  });
});
