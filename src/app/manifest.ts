import type { MetadataRoute } from 'next';

import { SITE_DESCRIPTION, SITE_TITLE } from '@/lib/site';

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: SITE_TITLE,
    short_name: 'Weather',
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any'
      },
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'maskable'
      }
    ]
  };
};

export default manifest;
