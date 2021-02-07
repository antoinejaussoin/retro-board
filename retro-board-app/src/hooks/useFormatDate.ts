import { formatDistanceToNow as formatDistanceToNowBase } from 'date-fns';
import { useCallback } from 'react';
import { useLanguage } from '../translations';

export default function useFormatDate() {
  const language = useLanguage();

  const formatDistanceToNow = useCallback(
    (date: Date | number, addSuffix = false) => {
      return formatDistanceToNowBase(date, {
        locale: language.dateLocale,
        addSuffix,
      });
    },
    [language]
  );

  return { formatDistanceToNow };
}
