import type { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';

const sitemap = (): MetadataRoute.Sitemap => {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1
    }
  ];
};

export default sitemap;
