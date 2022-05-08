import { Locale } from 'date-fns';
import { StripeLocales } from 'common';
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
const pt = () =>
  import('date-fns/locale/pt' /* webpackChunkName: "date-fns-pt" */);
const uk = () =>
  import('date-fns/locale/uk' /* webpackChunkName: "date-fns-uk" */);
const es = () =>
  import('date-fns/locale/es' /* webpackChunkName: "date-fns-es" */);

export interface Language {
  iso: string;
  name: string;
  englishName: string;
  dateLocale: () => Promise<{ default: Locale }>;
  stripeLocale: StripeLocales;
  locale: string;
}

export default [
  {
    dateLocale: enGB,
    iso: 'gb',
    name: 'English',
    englishName: 'English',
    stripeLocale: 'en-US',
    locale: 'en-GB',
  },
  {
    dateLocale: fr,
    iso: 'fr',
    name: 'Français',
    englishName: 'French',
    stripeLocale: 'fr-FR',
    locale: 'fr-FR',
  },
  {
    dateLocale: de,
    iso: 'de',
    name: 'Deutsch',
    englishName: 'German',
    stripeLocale: 'de-DE',
    locale: 'de-DE',
  },
  {
    dateLocale: es,
    iso: 'es',
    name: 'Español',
    englishName: 'Spanish',
    stripeLocale: 'es-ES',
    locale: 'es-ES',
  },
  {
    dateLocale: arDZ,
    iso: 'ae',
    name: 'عربي',
    englishName: 'Arabic',
    stripeLocale: 'ar-AR',
    locale: 'ar-SA',
  },
  {
    dateLocale: zhCN,
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
    stripeLocale: 'en-US',
    locale: 'zh-CN',
  },
  {
    dateLocale: zhTW,
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
    stripeLocale: 'en-US',
    locale: 'zh-TW',
  },
  {
    dateLocale: nl,
    iso: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
    stripeLocale: 'nl-NL',
    locale: 'nl-NL',
  },
  {
    dateLocale: hu,
    iso: 'hu',
    name: 'Magyar',
    englishName: 'Hungarian',
    stripeLocale: 'en-US',
    locale: 'hu-HU',
  },
  {
    dateLocale: it,
    iso: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    stripeLocale: 'it-IT',
    locale: 'it-IT',
  },
  {
    dateLocale: ja,
    iso: 'jp',
    name: '日本語',
    englishName: 'Japanese',
    stripeLocale: 'ja-JP',
    locale: 'ja-JP',
  },
  {
    dateLocale: pl,
    iso: 'pl',
    name: 'Polski',
    englishName: 'Polish',
    stripeLocale: 'en-US',
    locale: 'pl-PL',
  },
  {
    dateLocale: ptBR,
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
    stripeLocale: 'pt-BR',
    locale: 'pt-BR',
  },
  {
    dateLocale: pt,
    iso: 'pt',
    name: 'Português',
    englishName: 'Portuguese (Portugal)',
    stripeLocale: 'pt-PT',
    locale: 'pt-PT',
  },
  {
    dateLocale: uk,
    iso: 'ua',
    name: 'Yкраїнський',
    englishName: 'Ukrainian',
    stripeLocale: 'uk-UA',
    locale: 'uk-UA',
  },
] as Language[];
