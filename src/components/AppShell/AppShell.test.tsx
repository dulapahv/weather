import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import { conditionFamily } from '@/lib/weather-codes';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useWeather } from '@/hooks/useWeather';
import { usePreferences } from '@/store/preferences';
import { forecastFixture } from '@/tests/fixtures';

import { AppShell } from './AppShell';

vi.mock('@/hooks/useGeolocation', () => ({ useGeolocation: vi.fn() }));
vi.mock('@/hooks/useWeather', () => ({ useWeather: vi.fn() }));
vi.mock('@/hooks/useOnlineStatus', () => ({ useOnlineStatus: vi.fn() }));
vi.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: vi.fn() }));

const mockGeo = vi.mocked(useGeolocation);
const mockWeather = vi.mocked(useWeather);
const mockMedia = vi.mocked(useMediaQuery);

const LONDON = { latitude: 51.5, longitude: -0.12 };
const weather = toWeather(forecastFixture, LONDON);

describe('AppShell (home page)', () => {
  beforeEach(() => {
    mockMedia.mockReturnValue(true);
    mockWeather.mockReturnValue({
      weather: undefined,
      error: undefined,
      isLoading: false
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Zustand persists across tests in the same module; reset saved state so the rendered tree only
    // ever reflects the current-location entry.
    usePreferences.setState({ locations: [] });
  });

  it('should match the snapshot for the loaded home page', () => {
    mockGeo.mockReturnValue({
      status: 'ready',
      location: { ...LONDON, label: 'London', source: 'gps' },
      locate: vi.fn()
    });
    mockWeather.mockReturnValue({
      weather,
      error: undefined,
      isLoading: false
    });

    const { asFragment } = render(<AppShell shareEnabled />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match the snapshot while locating (loading state)', () => {
    mockGeo.mockReturnValue({
      status: 'locating',
      location: null,
      locate: vi.fn()
    });

    const { asFragment } = render(<AppShell shareEnabled />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match the snapshot for the empty state', () => {
    mockGeo.mockReturnValue({
      status: 'ready',
      location: null,
      locate: vi.fn()
    });

    const { asFragment } = render(<AppShell shareEnabled />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should tint the background with the selected condition when weather is loaded', () => {
    mockGeo.mockReturnValue({
      status: 'ready',
      location: { ...LONDON, label: 'London', source: 'gps' },
      locate: vi.fn()
    });
    mockWeather.mockReturnValue({ weather, error: undefined, isLoading: false });

    const { container } = render(<AppShell shareEnabled />);
    const layer = container.querySelector('[data-condition]');

    expect(layer).not.toBeNull();
    expect(layer?.getAttribute('data-condition')).toBe(
      conditionFamily(weather.current.weatherCode)
    );
  });

  it('should save and select the location from a share link', () => {
    mockGeo.mockReturnValue({
      status: 'ready',
      location: { ...LONDON, label: 'London', source: 'gps' },
      locate: vi.fn()
    });

    const shared = {
      id: 'shared:48.85,2.35',
      name: 'Paris',
      label: 'Paris',
      latitude: 48.85,
      longitude: 2.35
    };
    window.history.replaceState(null, '', '/?lat=48.85&lon=2.35&name=Paris');
    render(<AppShell shareEnabled sharedLocation={shared} />);

    expect(usePreferences.getState().locations).toContainEqual(shared);
    expect(window.location.search).toBe('');
    expect(mockWeather).toHaveBeenLastCalledWith(
      { latitude: shared.latitude, longitude: shared.longitude },
      expect.anything()
    );
  });

  it('should not render a condition tint while weather is unavailable', () => {
    mockGeo.mockReturnValue({ status: 'locating', location: null, locate: vi.fn() });

    const { container } = render(<AppShell shareEnabled />);
    expect(container.querySelector('[data-condition]')).toBeNull();
  });
});
