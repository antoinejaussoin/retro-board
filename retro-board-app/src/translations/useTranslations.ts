import { useContext, useMemo } from 'react';
import LanguageContext from './Context';
import en from './en';
import es from './es';
import fr from './fr';
import hu from './hu';
import ptbr from './pt-br';
import pl from './pl';
import nl from './nl';
import ru from './ru';
import zhtw from './zh-tw';
import zhcn from './zh-cn';
import ar from './ar';
import ja from './ja';
import de from './de';
import it from './it';
import { Translation } from './types';
import { merge, cloneDeep } from 'lodash';

interface Translations {
  [key: string]: Translation;
}

const languages: Translations = {
  en,
  es,
  fr,
  hu,
  pl,
  ptbr,
  nl,
  ru,
  zhtw,
  zhcn,
  ar,
  ja,
  de,
  it,
};

function useTranslation() {
  const language = useContext(LanguageContext);

  const result = useMemo(() => {
    const translations = languages[language.language];
    const english = languages['en'];
    return language.language === 'en'
      ? translations
      : merge(cloneDeep(english), translations);
  }, [language.language]);

  return result;
}

export default useTranslation;
