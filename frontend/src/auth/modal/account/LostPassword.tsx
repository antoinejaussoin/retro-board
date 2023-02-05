import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { Alert } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Email } from '@mui/icons-material';
import { resetPassword } from '../../../api';
import { Link } from 'react-router-dom';
import useBackendCapabilities from '../../../global/useBackendCapabilities';

const LostPassword = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const backend = useBackendCapabilities();
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

  if (!backend.emailAvailable && backend.selfHosted) {
    return (
      <Alert severity="info">
        You are using a Self-Hosted version of Retrospected, without email
        support. In order to reset your password, ask your admin (
        {backend.adminEmail}) to access the admin page to do that:&nbsp;
        <Link to="/admin">Admin Panel</Link>
      </Alert>
    );
  }

  return done ? (
    <Alert severity="success">{t('ResetPassword.doneMessage')}</Alert>
  ) : (
    <Wrapper
      header={t('ResetPassword.header')!}
      actions={
        <Button
          onClick={handleForgotPassword}
          color="primary"
          autoFocus
          disabled={!email.length}
        >
          {t('ResetPassword.resetButton')}
        </Button>
      }
    >
      <Alert severity="info">{t('ResetPassword.info')}</Alert>

      <Input
        value={email}
        onChangeValue={setEmail}
        title={t('AuthCommon.emailField')!}
        placeholder={t('AuthCommon.emailField')!}
        type="email"
        variant="standard"
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
    </Wrapper>
  );
};

export default LostPassword;
