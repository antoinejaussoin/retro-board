import styled from '@emotion/styled';
import { colors } from '@mui/material';
import { anonymousLogin, createDemoGame, me, updateLanguage } from 'api';
import UserContext from 'auth/Context';
import { useContext, useEffect } from 'react';
import { trackEvent } from 'track';
import { useLanguage } from 'translations';

export default function Demo() {
  const [language] = useLanguage();
  const { setUser } = useContext(UserContext);
  useEffect(() => {
    async function fetch() {
      await anonymousLogin('Demo User');
      trackEvent('register/demo');
      let updatedUser = await me();
      if (updatedUser?.language === null) {
        updatedUser = await updateLanguage(language.locale);
      }
      setUser(updatedUser);
      const session = await createDemoGame();
      if (session) {
        window.location.href = `/game/${session.id}`;
      }
    }
    fetch();
  }, [language.locale, setUser]);
  return (
    <Container>
      <h1>Hand tight...</h1>
    </Container>
  );
}

const Container = styled.div`
  background-color: ${colors.deepPurple[400]};
  display: flex;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 60px);

  h1 {
    color: white;
    font-size: 3rem;
  }
`;
