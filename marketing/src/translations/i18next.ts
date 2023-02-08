import i18n from 'i18next';
import fr from './fr.json';
import en from './en.json';
import { initReactI18next } from 'react-i18next';

i18n.use(initReactI18next).init({
  resources: {
    fr,
    en,
  },
  fallbackLng: 'en',
  debug: true,
  defaultNS: 'retrospected',
  ns: 'retrospected',
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
});

export default i18n;
