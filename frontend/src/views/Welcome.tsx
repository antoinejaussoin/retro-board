import styled from '@emotion/styled';
import LoginContent from 'auth/modal/LoginContent';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';

export function Welcome() {
  const { t } = useTranslation();
  return (
    <Container>
      <Title>{t('Welcome.title')}</Title>
      <LoginContainer>
        <LoginContent onClose={noop} anonymous />
      </LoginContainer>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  margin-left: 40px;
  margin-right: 40px;
  text-align: center;
  font-weight: 100;
  font-size: 4em;
  @media screen and (max-width: 700px) {
    font-size: 1.5em;
  }
`;

const LoginContainer = styled.div`
  width: 80%;
  border: 1px solid #ccc;

  margin-top: 20px;

  @media screen and (max-width: 700px) {
    width: 100%;
  }
`;
