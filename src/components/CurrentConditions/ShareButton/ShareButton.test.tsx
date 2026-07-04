import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { ShareButton } from './ShareButton';

const define = (prop: 'share' | 'clipboard', value: unknown) => {
  Object.defineProperty(navigator, prop, { value, configurable: true });
};

describe('ShareButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error clean up the test overrides
    delete navigator.share;
    // @ts-expect-error clean up the test overrides
    delete navigator.clipboard;
  });

  it('should use the native share sheet when available', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    define('share', share);

    render(<ShareButton name="London" latitude={51.5} longitude={-0.12} />);
    await userEvent.click(screen.getByRole('button', { name: /share london/i }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    const { url } = share.mock.calls[0][0];
    expect(url).toContain('lat=51.5');
    expect(url).toContain('lon=-0.12');
    expect(url).toContain('name=London');
  });

  it('should copy the link and confirm when share is unavailable', async () => {
    define('share', undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    define('clipboard', { writeText });

    render(<ShareButton name="Paris" latitude={48.85} longitude={2.35} />);
    await userEvent.click(screen.getByRole('button', { name: /share paris/i }));

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain('name=Paris');
    await screen.findByText('Copied');
  });
});
