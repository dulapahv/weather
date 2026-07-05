import { getCloudflareContext } from '@opennextjs/cloudflare';

import { jsonResponse } from '@/lib/api/http';

// When no IP geolocation is available, fall back to this.
const DEFAULT_LOCATION = {
  latitude: 13.7563,
  longitude: 100.5018,
  label: 'Bangkok',
  source: 'default' as const
};

export const GET = async () => {
  try {
    const { cf } = getCloudflareContext();
    const latitude = cf?.latitude != null ? Number(cf.latitude) : NaN;
    const longitude = cf?.longitude != null ? Number(cf.longitude) : NaN;
    if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
      const city = typeof cf?.city === 'string' ? cf.city : 'Approximate location';
      return jsonResponse({ latitude, longitude, label: city, source: 'ip' });
    }
  } catch {
    // getCloudflareContext throws outside the Worker runtime; use the default.
  }
  return jsonResponse(DEFAULT_LOCATION);
};
