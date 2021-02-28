import enGB from 'date-fns/locale/en-GB';
import fr from 'date-fns/locale/fr';
import arDZ from 'date-fns/locale/ar-DZ';
import zhCN from 'date-fns/locale/zh-CN';
import zhTW from 'date-fns/locale/zh-TW';
import nl from 'date-fns/locale/nl';
import de from 'date-fns/locale/de';
import hu from 'date-fns/locale/hu';
import it from 'date-fns/locale/it';
import ja from 'date-fns/locale/ja';
import pl from 'date-fns/locale/pl';
import ptBR from 'date-fns/locale/pt-BR';
import ru from 'date-fns/locale/ru';
import es from 'date-fns/locale/es';
import { Locale } from 'date-fns';
import { StripeLocales } from '@retrospected/common';

export interface Language {
  value: string;
  iso: string;
  name: string;
  englishName: string;
  dateLocale: Locale;
  stripeLocale: StripeLocales;
}

export default [
  {
    value: 'en',
    dateLocale: enGB,
    iso: 'gb',
    name: 'English',
    englishName: 'English',
    stripeLocale: 'en-US',
  },
  {
    value: 'fr',
    dateLocale: fr,
    iso: 'fr',
    name: 'Français',
    englishName: 'French',
    stripeLocale: 'fr-FR',
  },
  {
    value: 'ar',
    dateLocale: arDZ,
    iso: 'ae',
    name: 'عربي',
    englishName: 'Arabic',
    stripeLocale: 'ar-AR',
  },
  {
    value: 'zhcn',
    dateLocale: zhCN,
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
    stripeLocale: 'en-US',
  },
  {
    value: 'zhtw',
    dateLocale: zhTW,
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
    stripeLocale: 'en-US',
  },
  {
    value: 'nl',
    dateLocale: nl,
    iso: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
    stripeLocale: 'nl-NL',
  },
  {
    value: 'de',
    dateLocale: de,
    iso: 'de',
    name: 'Deutsch',
    englishName: 'German',
    stripeLocale: 'de-DE',
  },
  {
    value: 'hu',
    dateLocale: hu,
    iso: 'hu',
    name: 'Magyar',
    englishName: 'Hungarian',
    stripeLocale: 'en-US',
  },
  {
    value: 'it',
    dateLocale: it,
    iso: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    stripeLocale: 'it-IT',
  },
  {
    value: 'ja',
    dateLocale: ja,
    iso: 'jp',
    name: '日本語',
    englishName: 'Japanese',
    stripeLocale: 'ja-JP',
  },
  {
    value: 'pl',
    dateLocale: pl,
    iso: 'pl',
    name: 'Polski',
    englishName: 'Polish',
    stripeLocale: 'en-US',
  },
  {
    value: 'ptbr',
    dateLocale: ptBR,
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
    stripeLocale: 'pt-BR',
  },
  {
    value: 'ru',
    dateLocale: ru,
    iso: 'ru',
    name: 'Русский',
    englishName: 'Russian',
    stripeLocale: 'en-US',
  },
  {
    value: 'es',
    dateLocale: es,
    iso: 'es',
    name: 'Español',
    englishName: 'Spanish',
    stripeLocale: 'es-ES',
  },
] as Language[];
