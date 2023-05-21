import en from 'date-fns/locale/en-GB';
import fr from 'date-fns/locale/fr';
import de from 'date-fns/locale/de';
import nl from 'date-fns/locale/nl';

export function localeToDateFns(locale: string): Locale {
  switch (locale) {
    case 'fr':
      return fr;
    case 'de':
      return de;
    case 'nl':
      return nl;
    case 'en':
    default:
      return en;
  }
}
