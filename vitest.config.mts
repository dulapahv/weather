import path from 'node:path';

import react from '@vitejs/plugin-react';
import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  resolve: {
    tsconfigPaths: true,
    alias: {
      // `server-only` throws outside an RSC graph; stub it so server modules can be unit-tested.
      'server-only': path.resolve(process.cwd(), 'src/tests/server-only-stub.ts')
    }
  },
  css: {
    preprocessorOptions: {
      scss: {
        loadPaths: [path.join(process.cwd(), 'src', 'styles')]
      }
    }
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: [...configDefaults.exclude, 'src/e2e/**'],
    css: {
      include: [/.+/],
      modules: { classNameStrategy: 'non-scoped' }
    },
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'cobertura', 'html'],
      thresholds: {
        lines: 90
      }
    },
    reporters: ['default', 'junit'],
    outputFile: {
      junit: 'junit.xml'
    }
  }
});
