import de from 'date-fns/locale/de/index.js';
import en from 'date-fns/locale/en-GB/index.js';
import fr from 'date-fns/locale/fr/index.js';
import nl from 'date-fns/locale/nl/index.js';

export function localeToDateFns(locale: string): Locale {
  switch (locale) {
    case 'fr':
      return fr;
    case 'de':
      return de;
    case 'nl':
      return nl;
    default:
      return en;
  }
}
