import {
  type Locale,
  formatDistanceToNow as formatDistanceToNowBase,
} from 'date-fns';
import englishLocale from 'date-fns/locale/en-GB';
import { useEffect, useState } from 'react';
import { useLanguage } from '../translations';

export default function useFormatDate() {
  const locale = useDateLocale();

  return function formatLocale(date: Date | number, addSuffix = false) {
    return formatDistanceToNowBase(date, {
      locale: locale,
      addSuffix,
    });
  };
}

export function useDateLocale() {
  const [language] = useLanguage();
  const [locale, setLocale] = useState<Locale>(() => englishLocale);

  useEffect(() => {
    async function load() {
      const locale = await language.dateLocale();
      setLocale(locale.default);
    }
    load();
  }, [language]);

  return locale;
}
