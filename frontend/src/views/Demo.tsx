import styled from '@emotion/styled';
import { anonymousLogin, createDemoGame, me, updateLanguage } from 'api';
import useUser from 'state/user/useUser';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { trackEvent } from 'track';
import { Language } from 'translations/languages';
import { languages, useLanguage } from '../translations';
import { useSetUser } from 'state/user/useSetUser';

export default function Demo() {
  const user = useUser();
  const setUser = useSetUser();
  let [searchParams] = useSearchParams();
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
    <Container>
      <h1>Preparing demo...</h1>
    </Container>
  );
}

function getLanguage(twoLetter: string): Language {
  return languages.find((l) => l.twoLetter === twoLetter) || languages[0];
}

const Container = styled.div`
  background-color: var(--rs-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);

  h1 {
    color: var(--rs-accent-contrast);
    font-size: 3rem;
    font-weight: 600;
  }
`;
