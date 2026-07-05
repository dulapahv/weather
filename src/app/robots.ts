import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

const robots = (): MetadataRoute.Robots => {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL
  };
};

export default robots;
