import type { NextConfig } from 'next';

import path from 'node:path';

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  reactCompiler: true,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'styles')]
  }
};

initOpenNextCloudflareForDev();

export default nextConfig;
