import { getCloudflareContext } from '@opennextjs/cloudflare';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { isEnabled } from './flags';

vi.mock('@opennextjs/cloudflare', () => ({ getCloudflareContext: vi.fn() }));

const mockContext = vi.mocked(getCloudflareContext);

describe('isEnabled', () => {
  afterEach(() => vi.clearAllMocks());

  it('should fall back to the default when there is no Flagship binding', async () => {
    mockContext.mockReturnValue({ env: {} } as never);
    expect(await isEnabled('share', true)).toBe(true);
    expect(await isEnabled('share', false)).toBe(false);
  });

  it('should evaluate through the binding when present', async () => {
    mockContext.mockReturnValue({
      env: { FLAGS: { getBooleanValue: async () => false } }
    } as never);
    expect(await isEnabled('share', true)).toBe(false);
  });

  it('should fall back if evaluation throws (e.g. dev, no context)', async () => {
    mockContext.mockImplementation(() => {
      throw new Error('no cloudflare context');
    });
    expect(await isEnabled('share', true)).toBe(true);
  });
});
