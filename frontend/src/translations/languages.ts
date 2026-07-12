import type { StripeLocales } from 'common';
import type { Locale } from 'date-fns';

async function loadLocale(
  loader: () => Promise<Record<string, Locale>>,
  exportName: string,
): Promise<Locale> {
  const mod = await loader();
  return mod[exportName];
}

export interface Language {
  iso: string;
  name: string;
  englishName: string;
  dateLocale: () => Promise<Locale>;
  stripeLocale: StripeLocales;
  locale: string;
  twoLetter: string;
}

const languages: Language[] = [
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/en-GB'), 'enGB'),
    iso: 'gb',
    name: 'English',
    englishName: 'English',
    stripeLocale: 'en-US',
    locale: 'en-GB',
    twoLetter: 'en',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/fr'), 'fr'),
    iso: 'fr',
    name: 'Français',
    englishName: 'French',
    stripeLocale: 'fr-FR',
    locale: 'fr-FR',
    twoLetter: 'fr',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/de'), 'de'),
    iso: 'de',
    name: 'Deutsch',
    englishName: 'German',
    stripeLocale: 'de-DE',
    locale: 'de-DE',
    twoLetter: 'de',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/es'), 'es'),
    iso: 'es',
    name: 'Español',
    englishName: 'Spanish',
    stripeLocale: 'es-ES',
    locale: 'es-ES',
    twoLetter: 'es',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/ar-DZ'), 'arDZ'),
    iso: 'ae',
    name: 'عربي',
    englishName: 'Arabic',
    stripeLocale: 'ar-AR',
    locale: 'ar-SA',
    twoLetter: 'ar',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/zh-CN'), 'zhCN'),
    iso: 'cn',
    name: '簡中',
    englishName: 'Chinese (Simplified)',
    stripeLocale: 'en-US',
    locale: 'zh-CN',
    twoLetter: 'zh',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/zh-TW'), 'zhTW'),
    iso: 'tw',
    name: '繁中',
    englishName: 'Chinese (Traditional)',
    stripeLocale: 'en-US',
    locale: 'zh-TW',
    twoLetter: 'zh',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/nl'), 'nl'),
    iso: 'nl',
    name: 'Nederlands',
    englishName: 'Dutch',
    stripeLocale: 'nl-NL',
    locale: 'nl-NL',
    twoLetter: 'nl',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/hu'), 'hu'),
    iso: 'hu',
    name: 'Magyar',
    englishName: 'Hungarian',
    stripeLocale: 'en-US',
    locale: 'hu-HU',
    twoLetter: 'hu',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/it'), 'it'),
    iso: 'it',
    name: 'Italiano',
    englishName: 'Italian',
    stripeLocale: 'it-IT',
    locale: 'it-IT',
    twoLetter: 'it',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/ja'), 'ja'),
    iso: 'jp',
    name: '日本語',
    englishName: 'Japanese',
    stripeLocale: 'ja-JP',
    locale: 'ja-JP',
    twoLetter: 'ja',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/pl'), 'pl'),
    iso: 'pl',
    name: 'Polski',
    englishName: 'Polish',
    stripeLocale: 'en-US',
    locale: 'pl-PL',
    twoLetter: 'pl',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/pt-BR'), 'ptBR'),
    iso: 'br',
    name: 'Português Brasileiro',
    englishName: 'Portuguese (Brazilian)',
    stripeLocale: 'pt-BR',
    locale: 'pt-BR',
    twoLetter: 'pt',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/pt'), 'pt'),
    iso: 'pt',
    name: 'Português',
    englishName: 'Portuguese (Portugal)',
    stripeLocale: 'pt-PT',
    locale: 'pt-PT',
    twoLetter: 'pt',
  },
  {
    dateLocale: () => loadLocale(() => import('date-fns/locale/uk'), 'uk'),
    iso: 'ua',
    name: 'Yкраїнський',
    englishName: 'Ukrainian',
    stripeLocale: 'uk-UA',
    locale: 'uk-UA',
    twoLetter: 'uk',
  },
];

export default languages;
