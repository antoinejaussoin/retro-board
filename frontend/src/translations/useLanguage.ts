import { useCallback, useContext, useMemo } from 'react';
import languages, { Language } from './languages';
import { useTranslation } from 'react-i18next';
import { updateLanguage } from 'api';
import UserContext from 'auth/Context';
import { trackEvent } from 'track';
import { TrackingEvent } from 'common';

type UseLanguageResult = [
  language: Language,
  changeLanguage: (lng: string) => Promise<void>
];

export default function useLanguage(): UseLanguageResult {
  const { i18n } = useTranslation();
  const { user, setUser } = useContext(UserContext);

  const locale = i18n.language;
  const language = useMemo(() => {
    const foundLanguage = languages.find((l) => l.locale === locale);
    return foundLanguage || languages[0];
  }, [locale]);

  const handleChangeLanguage = useCallback(
    async (language: string) => {
      trackEvent(`language/change/${language}` as TrackingEvent);
      i18n.changeLanguage(language);
      if (user) {
        const updatedUser = await updateLanguage(language);
        if (updatedUser) {
          setUser(updatedUser);
        }
      }
    },
    [user, setUser, i18n]
  );

  return [language, handleChangeLanguage];
}
