import styled from '@emotion/styled';
import LoginContent from 'auth/modal/LoginContent';
import { noop } from 'lodash';
import { useTranslation } from 'react-i18next';
import { tokens } from 'tokens';

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
  padding: 48px 16px 32px;
`;

const Title = styled.h1`
  margin: 0 24px 8px;
  text-align: center;
  font-weight: 600;
  letter-spacing: -0.03em;
  font-size: 3rem;
  color: ${tokens.ink};
  @media screen and (max-width: 700px) {
    font-size: 2rem;
  }
`;

const LoginContainer = styled.div`
  width: min(440px, 92%);
  margin-top: 16px;
  background: ${tokens.paper};
  border: 1px solid ${tokens.border};
  border-radius: 16px;
  box-shadow: ${tokens.shadow};
  overflow: hidden;
`;
