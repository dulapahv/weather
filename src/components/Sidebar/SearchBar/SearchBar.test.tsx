import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { SearchResult } from '@/lib/schemas/search';

import { SearchBar } from './SearchBar';

const { useSearchMock } = vi.hoisted(() => ({ useSearchMock: vi.fn() }));
vi.mock('@/hooks/useSearch', () => ({ useSearch: useSearchMock }));

const result = (id: string, name: string): SearchResult => ({
  id,
  name,
  label: `${name}, Country`,
  latitude: 1,
  longitude: 2,
  admin1: 'Region',
  country: 'Country'
});

const mockSearch = (results: SearchResult[], isLoading = false) => {
  useSearchMock.mockReturnValue({
    results,
    isLoading,
    isActive: results.length > 0 || isLoading,
    error: undefined
  });
};

describe('SearchBar', () => {
  afterEach(() => useSearchMock.mockReset());

  it('should list matches and choose one on click, clearing the field', async () => {
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(2);

    await userEvent.click(options[0]);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
    expect(input).toHaveValue('');
  });

  it('should move the active option with the arrow keys and pick it with Enter', async () => {
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
  });

  it('should walk the list with Tab and Shift+Tab like the arrow keys', async () => {
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    const input = screen.getByRole('combobox');
    await userEvent.click(input);

    await userEvent.keyboard('{Tab}'); // London
    await userEvent.keyboard('{Tab}'); // Longview
    await userEvent.keyboard('{Shift>}{Tab}{/Shift}'); // London

    expect(input).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('should wrap past the last option back to the first', async () => {
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });

  it('should wrap up from nothing selected to the last option', async () => {
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    const onSelect = vi.fn();
    render(<SearchBar onSelect={onSelect} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowUp}{Enter}');
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '2' }));
  });

  it('should scroll the keyboard-active option into view', async () => {
    const scrollSpy = vi
      .spyOn(HTMLElement.prototype, 'scrollIntoView')
      .mockImplementation(() => {});
    mockSearch([result('1', 'London'), result('2', 'Longview')]);
    render(<SearchBar onSelect={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));
    await userEvent.keyboard('{ArrowDown}');

    const options = screen.getAllByRole('option');
    expect(scrollSpy).toHaveBeenCalled();
    expect(scrollSpy.mock.instances.at(-1)).toBe(options[0]);
    scrollSpy.mockRestore();
  });

  it('should show a no-matches note when an active query returns nothing', async () => {
    useSearchMock.mockReturnValue({
      results: [],
      isLoading: false,
      isActive: true,
      error: undefined
    });
    render(<SearchBar onSelect={vi.fn()} />);

    await userEvent.click(screen.getByRole('combobox'));
    expect(screen.getByRole('status')).toHaveTextContent('No matches');
  });
});
