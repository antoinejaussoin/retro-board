import { useContext, useEffect, useState } from 'react';
import LanguageContext from './Context';
import { Translation } from './types';
import merge from 'lodash/merge';
import cloneDeep from 'lodash/cloneDeep';

import en from './en';

const fr = () => import('./fr' /* webpackChunkName: 'lang-fr' */);
const hu = () => import('./hu' /* webpackChunkName: 'lang-hu' */);
const ptbr = () => import('./pt-br' /* webpackChunkName: 'lang-pt-br' */);
const pl = () => import('./pl' /* webpackChunkName: 'lang-pl' */);
const nl = () => import('./nl' /* webpackChunkName: 'lang-nl' */);
const ru = () => import('./ru' /* webpackChunkName: 'lang-ru' */);
const zhtw = () => import('./zh-tw' /* webpackChunkName: 'lang-zh-tw' */);
const zhcn = () => import('./zh-cn' /* webpackChunkName: 'lang-zh-cn' */);
const ar = () => import('./ar' /* webpackChunkName: 'lang-ar' */);
const ja = () => import('./ja' /* webpackChunkName: 'lang-ja' */);
const de = () => import('./de' /* webpackChunkName: 'lang-de' */);
const it = () => import('./it' /* webpackChunkName: 'lang-it' */);
const es = () => import('./es' /* webpackChunkName: 'lang-es' */);

interface Translations {
  [key: string]: () => Promise<any>;
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
        try {
          const { default: translations } = await languages[language]();
          setMerged(merge(cloneDeep(en), translations));
        } catch (ex) {
          setMerged(en);
        }
      }
    }
    load();
  }, [language]);

  return merged;
}

export default useTranslation;
