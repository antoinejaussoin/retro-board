import { useCallback, useState } from 'react';
import { Button, CircularProgress } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../../translations';
import { FullUser } from '@retrospected/common';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import Link from '../../../components/Link';
import { Email, VpnKey } from '@material-ui/icons';
import { accountLogin } from '../../../api';
import styled from 'styled-components';

interface LoginProps {
  onClose: () => void;
  onUser: (user: FullUser | null) => void;
  onAskRegistration: () => void;
  onAskPasswordReset: () => void;
}

const Login = ({
  onClose,
  onUser,
  onAskRegistration,
  onAskPasswordReset,
}: LoginProps) => {
  const {
    AccountLogin: translations,
    AuthCommon: authTranslations,
  } = useTranslations();
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const handleAccountogin = useCallback(() => {
    async function login() {
      if (loginEmail.length && loginPassword.length) {
        setLoading(true);
        const user = await accountLogin(loginEmail, loginPassword);
        setLoading(false);
        onUser(user);
        if (user) {
          if (onClose) {
            onClose();
          }
        } else {
          setError(translations.errorEmailPasswordIncorrect!);
        }
      }
    }
    login();
  }, [loginEmail, loginPassword, translations, onClose, onUser]);

  return (
    <Wrapper
      header={translations.header}
      actions={
        <Button
          onClick={handleAccountogin}
          color="primary"
          autoFocus
          startIcon={loading ? <CircularProgress size="1em" /> : null}
          disabled={!loginEmail || !loginPassword || loading}
        >
          {translations.loginButton}
        </Button>
      }
    >
      <Alert severity="info">{translations.info}</Alert>
      {!!error ? (
        <Alert severity="error" style={{ marginTop: 10 }}>
          {error}
        </Alert>
      ) : null}
      <Input
        value={loginEmail}
        onChangeValue={setLoginEmail}
        title={authTranslations.emailField}
        placeholder={authTranslations.emailField}
        type="email"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
      <Input
        value={loginPassword}
        onChangeValue={setLoginPassword}
        title={authTranslations.passwordField}
        placeholder={authTranslations.passwordField}
        type="password"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<VpnKey />}
      />
      <div style={{ marginTop: 20 }} />
      <Links>
        <Link onClick={onAskRegistration}>{translations.registerLink}</Link>
        <Link onClick={onAskPasswordReset}>
          {translations.forgotPasswordLink}
        </Link>
      </Links>
    </Wrapper>
  );
};

const Links = styled.div`
  display: flex;
  > :first-child {
    margin-right: 20px;
  }

  @media (max-width: 400px) {
    flex-direction: column;
    > :first-child {
      margin-right: 0px;
      margin-bottom: 5px;
    }
  }
`;

export default Login;
