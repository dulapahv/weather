import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DEFAULT_UNITS } from '@/store/preferences';

import type { DisplayLocation } from './LocationList/LocationList';
import { Sidebar } from './Sidebar';

const locations: DisplayLocation[] = [
  {
    id: 'paris',
    name: 'Paris',
    label: 'Paris',
    latitude: 48.8,
    longitude: 2.3
  }
];

const renderSidebar = (props: Partial<Parameters<typeof Sidebar>[0]> = {}) => {
  const handlers = {
    onToggleCollapse: vi.fn(),
    onToggleEdit: vi.fn(),
    onSelect: vi.fn(),
    onSearchSelect: vi.fn(),
    onRemove: vi.fn(),
    onReorder: vi.fn(),
    onOpenSettings: vi.fn()
  };
  render(
    <Sidebar
      collapsed={false}
      mobileOpen={false}
      hidden={false}
      locations={locations}
      selectedId="paris"
      units={DEFAULT_UNITS}
      editMode={false}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers };
};

describe('Sidebar', () => {
  it('should render search, the location list, and the collapse control', () => {
    renderSidebar();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paris/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collapse panel' })).toBeInTheDocument();
  });

  it('should collapse the panel when the control is pressed', async () => {
    const { onToggleCollapse } = renderSidebar();
    await userEvent.click(screen.getByRole('button', { name: 'Collapse panel' }));
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('should render no controls when collapsed', () => {
    renderSidebar({ collapsed: true });
    expect(screen.queryByRole('combobox')).toBeNull();
    expect(screen.queryByRole('button', { name: 'Collapse panel' })).toBeNull();
  });
});
