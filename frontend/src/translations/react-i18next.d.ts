import 'react-i18next';
import type ns1 from './locales/en-GB.json';

declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'ns1';
    resources: {
      ns1: typeof ns1;
    };
  }
}
