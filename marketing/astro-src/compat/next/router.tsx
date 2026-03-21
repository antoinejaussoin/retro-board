import React, { createContext, useContext } from 'react';
import { defaultLocale } from '../../lib/locales';

export type LegacyRouter = {
  locale: string;
  locales: string[];
  defaultLocale: string;
  asPath: string;
  pathname: string;
  isFallback: boolean;
  push: (path: string) => Promise<boolean>;
  replace: (path: string) => Promise<boolean>;
};

const RouterContext = createContext<LegacyRouter>({
  locale: defaultLocale,
  locales: ['en', 'fr', 'de'],
  defaultLocale,
  asPath: '/',
  pathname: '/',
  isFallback: false,
  push: async () => false,
  replace: async () => false,
});

export function RouterProvider({
  value,
  children,
}: {
  value: LegacyRouter;
  children: React.ReactNode;
}) {
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  return useContext(RouterContext);
}