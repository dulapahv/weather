import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the initial value immediately', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 200));
    expect(result.current).toBe('a');
  });

  it('should update only after the delay elapses', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' }
    });
    rerender({ v: 'ab' });
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(199));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('ab');
  });

  it('should reset the timer on rapid changes so only the last value sticks', () => {
    const { result, rerender } = renderHook(({ v }) => useDebouncedValue(v, 200), {
      initialProps: { v: 'a' }
    });
    rerender({ v: 'ab' });
    act(() => vi.advanceTimersByTime(100));
    rerender({ v: 'abc' });
    act(() => vi.advanceTimersByTime(199));
    expect(result.current).toBe('a');
    act(() => vi.advanceTimersByTime(1));
    expect(result.current).toBe('abc');
  });
});
