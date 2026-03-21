import fs from 'node:fs';
import { join } from 'node:path';
import { defaultLocale, type SupportedLocale } from './locales';

type DictionaryValue =
  | string
  | number
  | boolean
  | null
  | DictionaryValue[]
  | { [key: string]: DictionaryValue };

export type Dictionary = { [key: string]: DictionaryValue };

const dictionaryCache = new Map<SupportedLocale, Dictionary>();

export function loadDictionary(locale: SupportedLocale): Dictionary {
  const cached = dictionaryCache.get(locale);
  if (cached) {
    return cached;
  }

  const filePath = join(
    process.cwd(),
    'public',
    'locales',
    locale,
    'common.json',
  );

  const dictionary = JSON.parse(
    fs.readFileSync(filePath, 'utf8'),
  ) as Dictionary;
  dictionaryCache.set(locale, dictionary);
  return dictionary;
}

export function getDictionaryValue(
  dictionary: Dictionary,
  path: string,
): DictionaryValue | undefined {
  return path.split('.').reduce<DictionaryValue | undefined>((value, part) => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) {
      return undefined;
    }

    return (value as Dictionary)[part];
  }, dictionary);
}

export function getText(dictionary: Dictionary, path: string, fallback = path) {
  const value = getDictionaryValue(dictionary, path);
  return typeof value === 'string' ? value : fallback;
}

export function getTextList(dictionary: Dictionary, path: string) {
  const value = getDictionaryValue(dictionary, path);
  return Array.isArray(value)
    ? value.filter((item) => typeof item === 'string')
    : [];
}

export function loadDictionaryWithFallback(locale: SupportedLocale) {
  try {
    return loadDictionary(locale);
  } catch {
    return loadDictionary(defaultLocale);
  }
}
