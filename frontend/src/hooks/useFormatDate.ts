import { formatDistanceToNow as formatDistanceToNowBase } from 'date-fns';
import { useEffect, useState } from 'react';
import { useLanguage } from '../translations';

type FormatFunction = (date: Date | number, addSuffix?: boolean) => string;

function formatEnglish(date: Date | number, addSuffix = false) {
  return formatDistanceToNowBase(date, {
    addSuffix,
  });
}

export default function useFormatDate() {
  const language = useLanguage();
  const [formatDistanceToNow, setFormat] = useState<FormatFunction>(
    () => formatEnglish
  );

  useEffect(() => {
    async function load() {
      const locale = await language.dateLocale();
      setFormat(
        () =>
          (function formatLocale(date: Date | number, addSuffix = false) {
            return formatDistanceToNowBase(date, {
              locale: locale.default,
              addSuffix,
            });
          })
      );
    }
    load();
  }, [language]);

  return { formatDistanceToNow };
}
