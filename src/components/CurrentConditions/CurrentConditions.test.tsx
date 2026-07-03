import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import { forecastFixture } from '@/tests/fixtures';

import { CurrentConditions } from './CurrentConditions';

describe('CurrentConditions', () => {
  it('should render the temperature, condition, and location', () => {
    const weather = toWeather(forecastFixture, {
      latitude: 51.5,
      longitude: -0.12
    });

    render(
      <CurrentConditions
        weather={weather}
        locationLabel="London"
        sourceNote="Your location"
        shareEnabled
      />
    );

    expect(screen.getByRole('heading', { name: 'London' })).toBeInTheDocument();
    expect(screen.getByText('25°')).toBeInTheDocument();
    expect(screen.getByText('Partly cloudy')).toBeInTheDocument(); // code 2
    expect(screen.getByText('Your location')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /share/i })).toBeInTheDocument();
  });

  it('should hide the share control and source note when disabled/absent', () => {
    const weather = toWeather(forecastFixture, {
      latitude: 51.5,
      longitude: -0.12
    });

    render(<CurrentConditions weather={weather} locationLabel="London" shareEnabled={false} />);

    expect(screen.queryByRole('button', { name: /share/i })).toBeNull();
    expect(screen.queryByText('Your location')).toBeNull();
  });
});
