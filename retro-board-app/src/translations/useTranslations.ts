import { useContext, useEffect, useState } from 'react';
import LanguageContext from './Context';
import { Translation } from './types';
import { merge, cloneDeep } from 'lodash';

import en from './en';

const fr = import('./fr' /* webpackChunkName: 'fr' */);
const hu = import('./hu' /* webpackChunkName: 'hu' */);
const ptbr = import('./pt-br' /* webpackChunkName: 'pt-br' */);
const pl = import('./pl' /* webpackChunkName: 'pl' */);
const nl = import('./nl' /* webpackChunkName: 'nl' */);
const ru = import('./ru' /* webpackChunkName: 'ru' */);
const zhtw = import('./zh-tw' /* webpackChunkName: 'zh-tw' */);
const zhcn = import('./zh-cn' /* webpackChunkName: 'zh-cn' */);
const ar = import('./ar' /* webpackChunkName: 'ar' */);
const ja = import('./ja' /* webpackChunkName: 'ja' */);
const de = import('./de' /* webpackChunkName: 'de' */);
const it = import('./it' /* webpackChunkName: 'it' */);
const es = import('./es' /* webpackChunkName: "es" */);

interface Translations {
  [key: string]: Promise<any>;
}

const languages: Translations = {
  es,
  fr,
  hu,
  pl,
  ptbr,
  nl,
  ru,
  zhtw,
  zhcn,
  ar,
  ja,
  de,
  it,
};

export function useLanguage(): [string, (language: string) => void] {
  const { language, setLanguage } = useContext(LanguageContext);
  return [language, setLanguage];
}

function useTranslation() {
  const [language] = useLanguage();
  const [merged, setMerged] = useState<Translation>(en);

  useEffect(() => {
    async function load() {
      if (language === 'en') {
        setMerged(en);
      } else {
        const { default: translations } = await languages[language];
        setMerged(merge(cloneDeep(en), translations));
      }
    }
    load();
  }, [language]);

  return merged;
}

export default useTranslation;
