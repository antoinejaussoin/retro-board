import {
  type Locale,
  formatDistanceToNow as formatDistanceToNowBase,
} from 'date-fns';
import { enGB } from 'date-fns/locale/en-GB';
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
  const [locale, setLocale] = useState<Locale>(() => enGB);

  useEffect(() => {
    async function load() {
      const nextLocale = await language.dateLocale();
      setLocale(nextLocale);
    }
    load();
  }, [language]);

  return locale;
}
