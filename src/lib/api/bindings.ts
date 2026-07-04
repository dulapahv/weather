import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';

import type { RateLimitStore } from './rate-limit';

export const getRateLimitStore = (): RateLimitStore | undefined => {
  try {
    return (getCloudflareContext().env as { RATE_LIMIT_KV?: RateLimitStore }).RATE_LIMIT_KV;
  } catch {
    return undefined;
  }
};
