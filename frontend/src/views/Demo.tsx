import { anonymousLogin, createDemoGame, me, updateLanguage } from 'api';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useSetUser } from 'state/user/useSetUser';
import useUser from 'state/user/useUser';
import { trackEvent } from 'track';
import type { Language } from 'translations/languages';
import { languages, useLanguage } from '../translations';
import { Spinner } from 'ui/spinner';

export default function Demo() {
  const user = useUser();
  const setUser = useSetUser();
  const [searchParams] = useSearchParams();
  const twoLetter = searchParams.get('lang');
  const [currentLanguage, changeLanguage] = useLanguage();
  const language = getLanguage(twoLetter || 'en');
  const alreadyLoggedIn = !!user;

  useEffect(() => {
    if (currentLanguage.locale !== language.locale) {
      changeLanguage(language.locale);
    }
  }, [language.locale, currentLanguage.locale, changeLanguage]);

  useEffect(() => {
    async function login() {
      if (!alreadyLoggedIn) {
        const user = await anonymousLogin('Demo User');
        setUser(user);
      }
    }
    login();
  }, [alreadyLoggedIn, setUser]);

  useEffect(() => {
    async function fetch() {
      trackEvent('register/demo');
      let updatedUser = await me();
      if (updatedUser?.language === null) {
        updatedUser = await updateLanguage(language.locale);
      }
      setUser(updatedUser);
      changeLanguage(language.locale);
      const session = await createDemoGame();
      if (session) {
        window.location.href = `/game/${session.id}`;
      }
    }
    if (alreadyLoggedIn && language.locale === currentLanguage.locale) {
      fetch();
    }
  }, [
    language.locale,
    currentLanguage.locale,
    setUser,
    changeLanguage,
    alreadyLoggedIn,
  ]);
  return (
    <div className="flex min-h-[calc(100dvh-3.5rem)] items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-cream px-8 py-10 text-center text-ink shadow-card">
        <Spinner className="mx-auto" />
        <h1 className="mt-4 text-3xl font-medium tracking-tight">
          Preparing demo...
        </h1>
      </div>
    </div>
  );
}

function getLanguage(twoLetter: string): Language {
  return languages.find((l) => l.twoLetter === twoLetter) || languages[0];
}
