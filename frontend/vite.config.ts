import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';
import svgrPlugin from 'vite-plugin-svgr';
import inject from '@rollup/plugin-inject';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    viteTsconfigPaths(),
    svgrPlugin(),
    ViteEjsPlugin((config) => ({
      APP_VERSION: process.env.npm_package_version,
      APP_ENV: config.mode,
    })),
  ],
  assetsInclude: ['**/*.md'],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis',
      },
      // Enable esbuild polyfill plugins
      plugins: [
        NodeGlobalsPolyfillPlugin({
          process: true,
          buffer: true,
        }),
        NodeModulesPolyfillPlugin(),
      ],
    },
  },
  build: {
    rollupOptions: {
      plugins: [inject({ Buffer: ['buffer', 'Buffer'] }) as any],
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8081/',
      },
      '/socket.io': {
        target: 'http://localhost:8081/',
        ws: true,
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.test.tsx', '**/*.test.ts'],
    setupFiles: './src/tests/setup.ts',
  },
});
