import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_UNITS, usePreferences } from '@/store/preferences';

import { SettingsDialog } from './SettingsDialog';

const { setThemeMock } = vi.hoisted(() => ({ setThemeMock: vi.fn() }));
vi.mock('next-themes', () => ({
  useTheme: () => ({ theme: 'dark', setTheme: setThemeMock })
}));

const open = () => {
  const onClose = vi.fn();
  const view = render(<SettingsDialog open onClose={onClose} />);
  return { onClose, ...view };
};

describe('SettingsDialog', () => {
  afterEach(() => {
    setThemeMock.mockReset();
    usePreferences.setState({ units: DEFAULT_UNITS, locations: [] });
  });

  it('should render the settings once open', () => {
    open();
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Temperature' })).toBeInTheDocument();
  });

  it('should persist a unit change to the store', async () => {
    open();
    await userEvent.click(screen.getByRole('button', { name: '°F' }));
    expect(usePreferences.getState().units.temperature).toBe('fahrenheit');
  });

  it('should apply a theme change via next-themes', async () => {
    open();
    await userEvent.click(screen.getByRole('button', { name: 'Dark' }));
    expect(setThemeMock).toHaveBeenCalledWith('dark');
  });

  it('should restore defaults', async () => {
    usePreferences.getState().setUnit('temperature', 'fahrenheit');
    open();
    await userEvent.click(screen.getByRole('button', { name: /restore defaults/i }));
    expect(usePreferences.getState().units).toEqual(DEFAULT_UNITS);
  });

  it('should close via the close button', async () => {
    const { onClose } = open();
    await userEvent.click(screen.getByRole('button', { name: /close settings/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
