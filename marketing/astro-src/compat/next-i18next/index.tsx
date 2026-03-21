import React, { createContext, useContext } from 'react';
import type { Dictionary } from '../../lib/dictionary';

type TranslationContextValue = {
  locale: string;
  dictionary: Dictionary;
};

type TranslationOptions = {
  returnObjects?: boolean;
};

const TranslationContext = createContext<TranslationContextValue>({
  locale: 'en',
  dictionary: {},
});

export function TranslationProvider({
  locale,
  dictionary,
  children,
}: TranslationContextValue & { children: React.ReactNode }) {
  return (
    <TranslationContext.Provider value={{ locale, dictionary }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const { dictionary } = useContext(TranslationContext);

  return {
    t(path: string, options?: TranslationOptions) {
      const value = path.split('.').reduce<unknown>((current, segment) => {
        if (!current || typeof current !== 'object' || Array.isArray(current)) {
          return undefined;
        }

        return (current as Record<string, unknown>)[segment];
      }, dictionary);

      if (options?.returnObjects) {
        return value;
      }

      if (typeof value === 'string' || typeof value === 'number') {
        return String(value);
      }

      return path;
    },
    i18n: {
      language: useContext(TranslationContext).locale,
    },
  };
}

export function appWithTranslation<T>(component: T): T {
  return component;
}