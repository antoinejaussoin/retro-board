import i18n, { type CallbackError } from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { isProduction } from 'is-production';
import { initReactI18next } from 'react-i18next';
import config from 'utils/getConfig';

i18n
  .use(
    resourcesToBackend((language, _, callback) => {
      import(`./locales/${language}.json`)
        .then((resources) => {
          callback(null, resources);
        })
        .catch((error) => {
          callback(error as CallbackError, null);
        });
    }),
  )
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: config.DEFAULT_LANGUAGE,
    returnEmptyString: false,
    debug: !isProduction(),
    defaultNS: 'ns1',
    ns: 'ns1',

    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18n;
