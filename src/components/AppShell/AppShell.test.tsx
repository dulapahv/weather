import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toWeather } from '@/lib/api/transform';
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

    const { asFragment } = render(<AppShell />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match the snapshot while locating (loading state)', () => {
    mockGeo.mockReturnValue({
      status: 'locating',
      location: null,
      locate: vi.fn()
    });

    const { asFragment } = render(<AppShell />);
    expect(asFragment()).toMatchSnapshot();
  });

  it('should match the snapshot for the empty state', () => {
    mockGeo.mockReturnValue({
      status: 'ready',
      location: null,
      locate: vi.fn()
    });

    const { asFragment } = render(<AppShell />);
    expect(asFragment()).toMatchSnapshot();
  });
});
