import { useCallback, useMemo } from 'react';
import languages, { Language } from './languages';
import { useTranslation } from 'react-i18next';
import { updateLanguage } from 'api';
import { trackEvent } from 'track';
import { TrackingEvent } from 'common';
import useUser from 'state/user/useUser';
import { useSetUser } from 'state/user/useSetUser';

type UseLanguageResult = [
  language: Language,
  changeLanguage: (lng: string) => Promise<void>,
];

export default function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const user = useUser();
  const setUser = useSetUser();
  const hasUser = !!user;

  const locale = i18n.language;
  const language = useMemo(() => {
    const foundLanguage = languages.find((l) => l.locale === locale);
    return foundLanguage || languages[0];
  }, [locale]);

  const handleChangeLanguage = useCallback(
    async (language: string) => {
      trackEvent(`language/change/${language}` as TrackingEvent);
      i18n.changeLanguage(language);
      if (hasUser) {
        const updatedUser = await updateLanguage(language);
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    },
    [hasUser, setUser, i18n],
  );

  return [language, handleChangeLanguage];
}
