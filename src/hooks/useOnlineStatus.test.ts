import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  afterEach(() => vi.restoreAllMocks());

  it('should stay online while the probe succeeds', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null)));
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current).toBe(true);

    act(() => window.dispatchEvent(new Event('offline')));
    await waitFor(() => expect(result.current).toBe(true));
  });

  it('should go offline only when the probe confirms unreachability', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const { result } = renderHook(() => useOnlineStatus());

    act(() => window.dispatchEvent(new Event('offline')));
    await waitFor(() => expect(result.current).toBe(false));

    act(() => window.dispatchEvent(new Event('online')));
    expect(result.current).toBe(true);
  });

  it('should detect offline on mount (e.g. an offline reload)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network')));
    const { result } = renderHook(() => useOnlineStatus());

    await waitFor(() => expect(result.current).toBe(false));
  });
});
