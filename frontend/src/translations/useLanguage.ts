import LanguageContext from './Context';
import { useContext, useMemo } from 'react';
import languages, { Language } from './languages';

export default function useLanguage(): Language {
  const languageContext = useContext(LanguageContext);
  const languageIso = languageContext.language;
  const language = useMemo(() => {
    const foundLanguage = languages.find((l) => l.value === languageIso);
    return foundLanguage || languages[0];
  }, [languageIso]);
  return language;
}
