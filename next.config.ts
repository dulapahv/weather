import type { NextConfig } from 'next';

import path from 'node:path';

import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig: NextConfig = {
  experimental: {
    typedEnv: true,
    optimizePackageImports: ['@phosphor-icons/react'],
    turbopackFileSystemCacheForBuild: true,
    turbopackServerSideNestedAsyncChunking: true
  },
  images: {
    loader: 'custom',
    loaderFile: './image-loader.ts'
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

export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: '/monitoring'
});
