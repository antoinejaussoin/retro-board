import { Locale } from 'date-fns';
import { StripeLocales } from '@retrospected/common';
const arDZ = () =>
  import('date-fns/locale/ar-DZ' /* webpackChunkName: "date-fns-ar-DZ" */);
const zhCN = () =>
  import('date-fns/locale/zh-CN' /* webpackChunkName: "date-fns-zh-CN" */);
const zhTW = () =>
  import('date-fns/locale/zh-TW' /* webpackChunkName: "date-fns-zh-TW" */);
const fr = () =>
  import('date-fns/locale/fr' /* webpackChunkName: "date-fns-fr" */);
const enGB = () =>
  import('date-fns/locale/en-GB' /* webpackChunkName: "date-fns-en-GB" */);
const nl = () =>
  import('date-fns/locale/nl' /* webpackChunkName: "date-fns-nl" */);
const de = () =>
  import('date-fns/locale/de' /* webpackChunkName: "date-fns-de" */);
const hu = () =>
  import('date-fns/locale/hu' /* webpackChunkName: "date-fns-hu" */);
const it = () =>
  import('date-fns/locale/it' /* webpackChunkName: "date-fns-it" */);
const ja = () =>
  import('date-fns/locale/ja' /* webpackChunkName: "date-fns-ja" */);
const pl = () =>
  import('date-fns/locale/pl' /* webpackChunkName: "date-fns-pl" */);
const ptBR = () =>
  import('date-fns/locale/pt-BR' /* webpackChunkName: "date-fns-pt-BR" */);
const ru = () =>
  import('date-fns/locale/ru' /* webpackChunkName: "date-fns-ru" */);
const es = () =>
  import('date-fns/locale/es' /* webpackChunkName: "date-fns-es" */);

export interface Language {
  value: string;
  iso: string;
  name: string;
  englishName: string;
  dateLocale: () => Promise<{ default: Locale }>;
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
