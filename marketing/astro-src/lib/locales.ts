export const supportedLocales = ['en', 'fr', 'de'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'en';

export const localeNames: Record<SupportedLocale, string> = {
  en: 'English',
  fr: 'Francais',
  de: 'Deutsch',
};

export function isSupportedLocale(value: string): value is SupportedLocale {
  return supportedLocales.includes(value as SupportedLocale);
}

export function withLocale(locale: SupportedLocale, path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  const cleanPath = normalizedPath === '/' ? '' : normalizedPath;
  return locale === defaultLocale ? cleanPath || '/' : `/${locale}${cleanPath}`;
}

export function getNonDefaultLocales() {
  return supportedLocales.filter((locale) => locale !== defaultLocale);
}
