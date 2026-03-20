import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import svgrPlugin from 'vite-plugin-svgr';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import { ViteEjsPlugin } from 'vite-plugin-ejs';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    svgrPlugin(),
    nodePolyfills({
      include: ['buffer', 'process'],
    }),
    ViteEjsPlugin((config) => ({
      APP_VERSION: process.env.npm_package_version,
      APP_ENV: config.mode,
    })),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  assetsInclude: ['**/*.md'],
  define: {
    APP_VERSION: JSON.stringify(process.env.npm_package_version),
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
