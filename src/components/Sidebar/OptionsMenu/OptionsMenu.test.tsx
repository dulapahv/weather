import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { OptionsMenu } from './OptionsMenu';

const setup = (editing = false) => {
  const onToggleEdit = vi.fn();
  const onOpenSettings = vi.fn();
  render(
    <OptionsMenu editing={editing} onToggleEdit={onToggleEdit} onOpenSettings={onOpenSettings} />
  );
  return { onToggleEdit, onOpenSettings };
};

describe('OptionsMenu', () => {
  it('should show a Done button that leaves edit mode when editing', async () => {
    const { onToggleEdit } = setup(true);
    await userEvent.click(screen.getByRole('button', { name: 'Done editing' }));
    expect(onToggleEdit).toHaveBeenCalledTimes(1);
  });

  it('should open the menu and route each item to its handler', async () => {
    const { onToggleEdit, onOpenSettings } = setup();

    const trigger = screen.getByRole('button', { name: 'List options' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(screen.getByRole('menuitem', { name: 'Edit list' }));
    expect(onToggleEdit).toHaveBeenCalledTimes(1);
    // Selecting an item closes the menu.
    expect(screen.queryByRole('menu')).toBeNull();

    await userEvent.click(trigger);
    await userEvent.click(screen.getByRole('menuitem', { name: 'Settings' }));
    expect(onOpenSettings).toHaveBeenCalledTimes(1);
  });

  it('should close the menu on Escape and on an outside click', async () => {
    setup();
    const trigger = screen.getByRole('button', { name: 'List options' });

    await userEvent.click(trigger);
    await userEvent.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).toBeNull();

    await userEvent.click(trigger);
    await userEvent.click(document.body);
    expect(screen.queryByRole('menu')).toBeNull();
  });
});
