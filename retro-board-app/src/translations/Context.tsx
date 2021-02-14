import { createContext } from 'react';
import config from '../utils/getConfig';

const LanguageContext = createContext({
  language: config.defaultLanguage,
  setLanguage: (_: string) => {},
});

export default LanguageContext;
