import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';
import { loadDictionaryWithFallback } from '../lib/dictionary';
import {
  defaultLocale,
  supportedLocales,
  type SupportedLocale,
} from '../lib/locales';
import { RouterProvider, type LegacyRouter } from './next/router';
import { TranslationProvider } from './next-i18next';

type RenderInput<TProps extends object> = {
  component: React.ComponentType<TProps>;
  props: TProps;
  locale: SupportedLocale;
  asPath: string;
  pathname: string;
};

export function renderLegacyPage<TProps extends object>({
  component: Component,
  props,
  locale,
  asPath,
  pathname,
}: RenderInput<TProps>) {
  const sheet = new ServerStyleSheet();
  const dictionary = loadDictionaryWithFallback(locale);
  const router: LegacyRouter = {
    locale,
    locales: [...supportedLocales],
    defaultLocale,
    asPath,
    pathname,
    isFallback: false,
    push: async () => false,
    replace: async () => false,
  };

  try {
    const html = renderToStaticMarkup(
      sheet.collectStyles(
        <TranslationProvider locale={locale} dictionary={dictionary}>
          <RouterProvider value={router}>
            {React.createElement(Component, props)}
          </RouterProvider>
        </TranslationProvider>,
      ),
    );

    return {
      html,
      styles: extractCssText(sheet.getStyleTags()),
    };
  } finally {
    sheet.seal();
  }
}

function extractCssText(styleTags: string) {
  return Array.from(styleTags.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g))
    .map((match) => match[1])
    .join('\n');
}