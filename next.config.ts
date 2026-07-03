import type { NextConfig } from 'next';

import path from 'node:path';

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
    optimizePackageImports: ['@phosphor-icons/react'],
    turbopackFileSystemCacheForBuild: true,
    turbopackServerSideNestedAsyncChunking: true
  },
  logging: {
    browserToTerminal: true
  },
  poweredByHeader: false,
  reactCompiler: true,
  sassOptions: {
    loadPaths: [path.join(process.cwd(), 'src', 'styles')]
  },
  typedRoutes: true
};

initOpenNextCloudflareForDev();

export default nextConfig;
