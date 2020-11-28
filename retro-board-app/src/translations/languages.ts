import {
  enGB,
  fr,
  arDZ,
  zhCN,
  zhTW,
  nl,
  de,
  hu,
  it,
  ja,
  pl,
  ptBR,
  ru,
  es,
} from 'date-fns/locale';
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
