import type { StripeLocales } from 'common';
import type { Locale } from 'date-fns';
const arDZ = () => import('date-fns/locale/ar-DZ');
const zhCN = () => import('date-fns/locale/zh-CN');
const zhTW = () => import('date-fns/locale/zh-TW');
const fr = () => import('date-fns/locale/fr');
const enGB = () => import('date-fns/locale/en-GB');
const nl = () => import('date-fns/locale/nl');
const de = () => import('date-fns/locale/de');
const hu = () => import('date-fns/locale/hu');
const it = () => import('date-fns/locale/it');
const ja = () => import('date-fns/locale/ja');
const pl = () => import('date-fns/locale/pl');
const ptBR = () => import('date-fns/locale/pt-BR');
const pt = () => import('date-fns/locale/pt');
const uk = () => import('date-fns/locale/uk');
const es = () => import('date-fns/locale/es');

export interface Language {
  iso: string;
  name: string;
  englishName: string;
  dateLocale: () => Promise<{ default: Locale }>;
  stripeLocale: StripeLocales;
  locale: string;
  twoLetter: string;
}

const languages: Language[] = [
  {
    dateLocale: enGB,
    iso: 'gb',
    name: 'English',
    englishName: 'English',
    stripeLocale: 'en-US',
    locale: 'en-GB',
    twoLetter: 'en',
  },
  {
    dateLocale: fr,
    iso: 'fr',
    name: 'Français',
    englishName: 'French',
    stripeLocale: 'fr-FR',
    locale: 'fr-FR',
    twoLetter: 'fr',
  },
  {
    dateLocale: de,
    iso: 'de',
    name: 'Deutsch',
    englishName: 'German',
    stripeLocale: 'de-DE',
    locale: 'de-DE',
    twoLetter: 'de',
  },
  {
    dateLocale: es,
    iso: 'es',
    name: 'Español',
    englishName: 'Spanish',
    stripeLocale: 'es-ES',
    locale: 'es-ES',
    twoLetter: 'es',
  },
  {
    dateLocale: arDZ,
    iso: 'ae',
    name: 'عربي',
    englishName: 'Arabic',
    stripeLocale: 'ar-AR',
    locale: 'ar-SA',
    twoLetter: 'ar',
  },
  {
    dateLocale: zhCN,
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
    stripeLocale: 'en-US',
    locale: 'zh-CN',
    twoLetter: 'zh',
  },
  {
    dateLocale: zhTW,
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
    stripeLocale: 'en-US',
    locale: 'zh-TW',
    twoLetter: 'zh',
  },
  {
    dateLocale: nl,
    iso: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
    stripeLocale: 'nl-NL',
    locale: 'nl-NL',
    twoLetter: 'nl',
  },
  {
    dateLocale: hu,
    iso: 'hu',
    name: 'Magyar',
    englishName: 'Hungarian',
    stripeLocale: 'en-US',
    locale: 'hu-HU',
    twoLetter: 'hu',
  },
  {
    dateLocale: it,
    iso: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    stripeLocale: 'it-IT',
    locale: 'it-IT',
    twoLetter: 'it',
  },
  {
    dateLocale: ja,
    iso: 'jp',
    name: '日本語',
    englishName: 'Japanese',
    stripeLocale: 'ja-JP',
    locale: 'ja-JP',
    twoLetter: 'ja',
  },
  {
    dateLocale: pl,
    iso: 'pl',
    name: 'Polski',
    englishName: 'Polish',
    stripeLocale: 'en-US',
    locale: 'pl-PL',
    twoLetter: 'pl',
  },
  {
    dateLocale: ptBR,
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
    stripeLocale: 'pt-BR',
    locale: 'pt-BR',
    twoLetter: 'pt',
  },
  {
    dateLocale: pt,
    iso: 'pt',
    name: 'Português',
    englishName: 'Portuguese (Portugal)',
    stripeLocale: 'pt-PT',
    locale: 'pt-PT',
    twoLetter: 'pt',
  },
  {
    dateLocale: uk,
    iso: 'ua',
    name: 'Yкраїнський',
    englishName: 'Ukrainian',
    stripeLocale: 'uk-UA',
    locale: 'uk-UA',
    twoLetter: 'uk',
  },
];

export default languages;
