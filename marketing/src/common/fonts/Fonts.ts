import localFont from 'next/font/local';

// Self-hosted so `next build` does not download Google Fonts.
// next/font/google crashes when Google returns an extensionless font URL.
export const sourceSerifPro = localFont({
  src: [
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-200-normal.woff2',
      weight: '200',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-200-italic.woff2',
      weight: '200',
      style: 'italic',
    },
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-normal.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-400-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-700-normal.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../../node_modules/@fontsource/source-serif-4/files/source-serif-4-latin-700-italic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
  adjustFontFallback: 'Times New Roman',
});
