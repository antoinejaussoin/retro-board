import 'react-i18next';
import common from '../public/locales/en/common.json';

declare module '@redq/reuse-modal';
declare module 'react-reveal';
declare module 'react-reveal/Fade';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
    };
  }
}
