import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { toWeather } from '@/lib/api/transform';
import { DEFAULT_UNITS } from '@/store/preferences';
import { forecastFixture } from '@/tests/fixtures';

import { LocationList, type DisplayLocation } from './LocationList';

const { useWeatherMock } = vi.hoisted(() => ({ useWeatherMock: vi.fn() }));

vi.mock('@/hooks/useWeather', () => ({
  useWeather: (...args: unknown[]) => useWeatherMock(...args)
}));

const current: DisplayLocation = {
  id: 'current',
  name: '',
  label: '',
  latitude: 51.5,
  longitude: -0.1,
  pinned: true
};
const paris: DisplayLocation = {
  id: 'paris',
  name: 'Paris',
  label: 'Paris',
  latitude: 48.8,
  longitude: 2.3
};
const tokyo: DisplayLocation = {
  id: 'tokyo',
  name: 'Tokyo',
  label: 'Tokyo',
  latitude: 35.6,
  longitude: 139.7
};

const renderList = (props: Partial<Parameters<typeof LocationList>[0]> = {}) => {
  const handlers = {
    onSelect: vi.fn(),
    onRemove: vi.fn(),
    onReorder: vi.fn()
  };
  render(
    <LocationList
      locations={[paris, tokyo]}
      selectedId="paris"
      units={DEFAULT_UNITS}
      editMode={false}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers };
};

describe('LocationList', () => {
  beforeEach(() => {
    useWeatherMock.mockReturnValue({
      weather: undefined,
      error: undefined,
      isLoading: false
    });
  });

  afterEach(() => vi.useRealTimers());

  it('should show an empty hint when there are no locations', () => {
    renderList({ locations: [] });
    expect(screen.getByText('No locations yet — search to add one.')).toBeInTheDocument();
  });

  it('should mark the selected row and select another on click', async () => {
    const { onSelect } = renderList();

    expect(screen.getByRole('button', { name: 'Paris' })).toHaveAttribute('aria-current', 'true');
    await userEvent.click(screen.getByRole('button', { name: 'Tokyo' }));
    expect(onSelect).toHaveBeenCalledWith('tokyo');
  });

  it('should move focus between rows with the arrow keys', async () => {
    renderList();
    const buttons = screen.getAllByRole('button');
    buttons[0].focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(buttons[1]);

    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it('should wrap focus around both ends with the arrow keys', async () => {
    renderList();
    const buttons = screen.getAllByRole('button');
    const last = buttons.length - 1;

    buttons[0].focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(buttons[last]);

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(buttons[0]);
  });

  it("should show temperature and conditions once a row's weather loads", () => {
    useWeatherMock.mockReturnValue({
      weather: toWeather(forecastFixture, { latitude: 48.8, longitude: 2.3 }),
      error: undefined,
      isLoading: false
    });
    renderList({ locations: [paris] });

    const row = screen.getByRole('button', { name: /Paris/ });
    expect(row).toHaveTextContent('Partly cloudy');
    expect(row).toHaveTextContent('25°');
  });

  it('should update the local time label when the minute ticks over', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-07T11:59:30Z'));
    useWeatherMock.mockReturnValue({
      weather: toWeather(forecastFixture, { latitude: 48.8, longitude: 2.3 }),
      error: undefined,
      isLoading: false
    });
    renderList({ locations: [paris] });

    const row = screen.getByRole('button', { name: /Paris/ });
    const before = row.textContent;

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(row.textContent).not.toBe(before);
    vi.useRealTimers();
  });

  it('should keep the pinned row and expose remove controls in edit mode', async () => {
    const { onRemove } = renderList({
      locations: [current, paris, tokyo],
      editMode: true
    });

    expect(screen.getByText('My Location')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Remove Paris' }));
    expect(onRemove).toHaveBeenCalledWith('paris');
    expect(screen.getByRole('button', { name: 'Reorder Tokyo' })).toBeInTheDocument();
  });
});
