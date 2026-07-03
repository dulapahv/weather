import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';

interface FlagshipBinding {
  getBooleanValue(
    flag: string,
    defaultValue: boolean,
    context?: Record<string, unknown>
  ): Promise<boolean>;
}

export async function isEnabled(flag: string, fallback = false): Promise<boolean> {
  try {
    const { env } = getCloudflareContext();
    const flags = (env as unknown as { FLAGS?: FlagshipBinding }).FLAGS;
    if (!flags) return fallback;
    return await flags.getBooleanValue(flag, fallback);
  } catch {
    return fallback;
  }
}
