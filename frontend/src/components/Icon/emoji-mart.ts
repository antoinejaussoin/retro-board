import data from '@emoji-mart/data';
import { init } from 'emoji-mart';

let initPromise: Promise<void> | null = null;

/** Locales shipped with `@emoji-mart/data/i18n`. */
const EMOJI_MART_LOCALES = new Set([
  'ar',
  'be',
  'cs',
  'de',
  'en',
  'es',
  'fa',
  'fi',
  'fr',
  'hi',
  'it',
  'ja',
  'ko',
  'nl',
  'pl',
  'pt',
  'ru',
  'sa',
  'tr',
  'uk',
  'vi',
  'zh',
]);

const i18nLoaders: Record<
  string,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  ar: () => import('@emoji-mart/data/i18n/ar.json'),
  be: () => import('@emoji-mart/data/i18n/be.json'),
  cs: () => import('@emoji-mart/data/i18n/cs.json'),
  de: () => import('@emoji-mart/data/i18n/de.json'),
  en: () => import('@emoji-mart/data/i18n/en.json'),
  es: () => import('@emoji-mart/data/i18n/es.json'),
  fa: () => import('@emoji-mart/data/i18n/fa.json'),
  fi: () => import('@emoji-mart/data/i18n/fi.json'),
  fr: () => import('@emoji-mart/data/i18n/fr.json'),
  hi: () => import('@emoji-mart/data/i18n/hi.json'),
  it: () => import('@emoji-mart/data/i18n/it.json'),
  ja: () => import('@emoji-mart/data/i18n/ja.json'),
  ko: () => import('@emoji-mart/data/i18n/ko.json'),
  nl: () => import('@emoji-mart/data/i18n/nl.json'),
  pl: () => import('@emoji-mart/data/i18n/pl.json'),
  pt: () => import('@emoji-mart/data/i18n/pt.json'),
  ru: () => import('@emoji-mart/data/i18n/ru.json'),
  sa: () => import('@emoji-mart/data/i18n/sa.json'),
  tr: () => import('@emoji-mart/data/i18n/tr.json'),
  uk: () => import('@emoji-mart/data/i18n/uk.json'),
  vi: () => import('@emoji-mart/data/i18n/vi.json'),
  zh: () => import('@emoji-mart/data/i18n/zh.json'),
};

export function initEmojiMart(): Promise<void> {
  if (!initPromise) {
    initPromise = init({ data });
  }
  return initPromise;
}

/** Map an app language (`fr-FR`, `zh-CN`, …) to an emoji-mart locale, or `en`. */
export function emojiMartLocale(language: string | undefined): string {
  const base = (language ?? 'en').split('-')[0]?.toLowerCase() || 'en';
  return EMOJI_MART_LOCALES.has(base) ? base : 'en';
}

export async function loadEmojiMartI18n(
  language: string | undefined,
): Promise<Record<string, unknown>> {
  const locale = emojiMartLocale(language);
  const mod = await i18nLoaders[locale]!();
  return mod.default;
}

/** Normalize stored icon values (`question` or `:question:`) for em-emoji. */
export function emojiElementProps(icon: string | null): {
  id?: string;
  shortcodes?: string;
} {
  const value = icon || 'grey_question';
  if (value.includes(':')) {
    return { shortcodes: value };
  }
  return { id: value };
}
