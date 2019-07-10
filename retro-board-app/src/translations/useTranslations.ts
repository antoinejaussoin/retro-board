import { useContext } from 'react';
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
import { Translation } from './types';

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
};

function useTranslation() {
  const language = useContext(LanguageContext);
  return languages[language.language];
}

export default useTranslation;
