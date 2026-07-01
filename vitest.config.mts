import path from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside an RSC graph; stub it so server modules can be unit-tested.
      'server-only': path.resolve(process.cwd(), 'tests/server-only-stub.ts')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.join(process.cwd(), 'styles')]
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    css: true,
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura', 'html']
    },
    reporters: ['dot']
  }
});
