import path from 'node:path';
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { transformWithEsbuild } from 'vite';

const resolveFromMarketing = (value) => path.resolve('./', value);

export default defineConfig({
  srcDir: './astro-src',
  output: 'static',
  integrations: [react()],
  vite: {
    plugins: [
      {
        name: 'marketing-legacy-jsx',
        async transform(code, id) {
          if (!id.includes('/marketing/src/') || !id.endsWith('.js')) {
            return null;
          }

          return transformWithEsbuild(code, id, {
            loader: 'jsx',
            jsx: 'automatic',
          });
        },
      },
    ],
    resolve: {
      alias: [
        {
          find: /^next-i18next\/serverSideTranslations$/,
          replacement: resolveFromMarketing(
            'astro-src/compat/next-i18next/serverSideTranslations.ts',
          ),
        },
        {
          find: /^next-i18next$/,
          replacement: resolveFromMarketing('astro-src/compat/next-i18next/index.tsx'),
        },
        { find: '@', replacement: resolveFromMarketing('src') },
        { find: 'next/head', replacement: resolveFromMarketing('astro-src/compat/next/head.tsx') },
        { find: 'next/link', replacement: resolveFromMarketing('astro-src/compat/next/link.tsx') },
        { find: 'next/image', replacement: resolveFromMarketing('astro-src/compat/next/image.tsx') },
        { find: 'next/router', replacement: resolveFromMarketing('astro-src/compat/next/router.tsx') },
        { find: 'next/error', replacement: resolveFromMarketing('astro-src/compat/next/error.tsx') },
        { find: 'next/font/google', replacement: resolveFromMarketing('astro-src/compat/next/font-google.ts') },
        { find: 'next/dynamic', replacement: resolveFromMarketing('astro-src/compat/next/dynamic.tsx') },
        {
          find: /^styled-components$/,
          replacement: resolveFromMarketing('astro-src/compat/styled-components.ts'),
        },
        {
          find: /^@styled-system\/theme-get$/,
          replacement: resolveFromMarketing('astro-src/compat/theme-get.ts'),
        },
        {
          find: /^rc-collapse$/,
          replacement: resolveFromMarketing('astro-src/compat/rc-collapse.ts'),
        },
        {
          find: /^react-slick$/,
          replacement: resolveFromMarketing('astro-src/compat/react-slick.ts'),
        },
        {
          find: /^react-scrollspy$/,
          replacement: resolveFromMarketing('astro-src/compat/react-scrollspy.ts'),
        },
        {
          find: /^rc-drawer$/,
          replacement: resolveFromMarketing('astro-src/compat/rc-drawer.ts'),
        },
        {
          find: /^react-reveal\/Fade$/,
          replacement: resolveFromMarketing('astro-src/compat/react-reveal-fade.ts'),
        },
        {
          find: /^react-anchor-link-smooth-scroll$/,
          replacement: resolveFromMarketing('astro-src/compat/react-anchor-link-smooth-scroll.ts'),
        },
      ],
    },
    define: {
      'process.env.NEXT_PUBLIC_MEASUREMENT_ID': JSON.stringify(
        process.env.NEXT_PUBLIC_MEASUREMENT_ID ?? '',
      ),
      'process.env.NEXT_PUBLIC_APP_URL': JSON.stringify(
        process.env.NEXT_PUBLIC_APP_URL ?? '',
      ),
      'process.env.NEXT_PUBLIC_GOOGLE_AD_WORDS_ID': JSON.stringify(
        process.env.NEXT_PUBLIC_GOOGLE_AD_WORDS_ID ?? '',
      ),
      'process.env.NEXT_PUBLIC_GOOGLE_AD_WORDS_DOMAINS': JSON.stringify(
        process.env.NEXT_PUBLIC_GOOGLE_AD_WORDS_DOMAINS ?? '',
      ),
      'process.env.NEXT_PUBLIC_COOKIE_DOMAIN': JSON.stringify(
        process.env.NEXT_PUBLIC_COOKIE_DOMAIN ?? '',
      ),
    },
  },
});