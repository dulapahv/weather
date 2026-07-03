import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import { forecastFixture } from '@/tests/fixtures';

import { TenDayForecast } from './TenDayForecast';

const weather = toWeather(forecastFixture, { latitude: 51.5, longitude: 0 });

describe('TenDayForecast', () => {
  it("should label the first day 'Today' and shows its high/low", () => {
    render(<TenDayForecast weather={weather} />);

    expect(screen.getByRole('region', { name: '10-day forecast' })).toBeInTheDocument();
    expect(screen.getByText('Today')).toBeInTheDocument();
    expect(screen.getByText('33°')).toBeInTheDocument();
    expect(screen.getByText('22°')).toBeInTheDocument();
  });

  it('should render nothing when there is no daily data', () => {
    const empty = { ...weather, daily: [] };
    const { container } = render(<TenDayForecast weather={empty} />);
    expect(container.firstChild).toBeNull();
  });

  it("should mark the current temperature on today's range only", () => {
    render(<TenDayForecast weather={weather} />);

    const markers = screen.getAllByTitle(/^Now:/);
    expect(markers).toHaveLength(1);
    expect(markers[0]).toHaveAttribute('title', 'Now: 25°');
  });
});
