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

export interface Language {
  value: string;
  iso: string;
  name: string;
  englishName: string;
  dateLocale: Locale;
}

export default [
  {
    value: 'en',
    dateLocale: enGB,
    iso: 'gb',
    name: 'English',
    englishName: 'English',
  },
  {
    value: 'fr',
    dateLocale: fr,
    iso: 'fr',
    name: 'Français',
    englishName: 'French',
  },
  {
    value: 'ar',
    dateLocale: arDZ,
    iso: 'ae',
    name: 'عربي',
    englishName: 'Arabic',
  },
  {
    value: 'zhcn',
    dateLocale: zhCN,
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
  },
  {
    value: 'zhtw',
    dateLocale: zhTW,
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
  },
  {
    value: 'nl',
    dateLocale: nl,
    iso: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
  },
  {
    value: 'de',
    dateLocale: de,
    iso: 'de',
    name: 'Deutsch',
    englishName: 'German',
  },
  {
    value: 'hu',
    dateLocale: hu,
    iso: 'hu',
    name: 'Magyar',
    englishName: 'Hungarian',
  },
  {
    value: 'it',
    dateLocale: it,
    iso: 'it',
    name: 'Italiano',
    englishName: 'Italian',
  },
  {
    value: 'ja',
    dateLocale: ja,
    iso: 'jp',
    name: '日本語',
    englishName: 'Japanese',
  },
  {
    value: 'pl',
    dateLocale: pl,
    iso: 'pl',
    name: 'Polski',
    englishName: 'Polish',
  },
  {
    value: 'ptbr',
    dateLocale: ptBR,
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
  },
  {
    value: 'ru',
    dateLocale: ru,
    iso: 'ru',
    name: 'Русский',
    englishName: 'Russian',
  },
  {
    value: 'es',
    dateLocale: es,
    iso: 'es',
    name: 'Español',
    englishName: 'Spanish',
  },
] as Language[];
