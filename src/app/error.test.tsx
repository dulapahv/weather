import { captureException } from '@sentry/nextjs';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import ErrorPage from './error';

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn()
}));

const makeError = (digest?: string) =>
  Object.assign(new Error('boom'), digest ? { digest } : undefined);

describe('ErrorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should report the error to Sentry', () => {
    const error = makeError();
    render(<ErrorPage error={error} reset={() => {}} />);

    expect(captureException).toHaveBeenCalledTimes(1);
    expect(captureException).toHaveBeenCalledWith(error);
  });

  it('should reset the boundary when "Try again" is clicked', async () => {
    const reset = vi.fn();
    render(<ErrorPage error={makeError()} reset={reset} />);

    await userEvent.click(screen.getByRole('button', { name: /try again/i }));

    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('should show the error digest when present', () => {
    render(<ErrorPage error={makeError('abc123')} reset={() => {}} />);

    expect(screen.getByText('Error ID: abc123')).toBeInTheDocument();
  });

  it('should omit the digest line when absent', () => {
    render(<ErrorPage error={makeError()} reset={() => {}} />);

    expect(screen.queryByText(/Error ID/)).toBeNull();
  });
});
