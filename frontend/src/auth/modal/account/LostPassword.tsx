import { useCallback, useState } from 'react';
import Button from '@mui/material/Button';
import { Alert } from '@mui/material';
import useTranslations from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Email } from '@mui/icons-material';
import { resetPassword } from '../../../api';
import { Link } from 'react-router-dom';
import useAdminEmail from '../../../global/useAdminEmail';
import useIsSendGridAvailable from '../../../global/useIsSendGridAvailable';

const LostPassword = () => {
  const { ResetPassword: translations, AuthCommon: authTranslations } =
    useTranslations();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const adminEmail = useAdminEmail();
  const canUseSendgrid = useIsSendGridAvailable();
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

  if (!canUseSendgrid) {
    return (
      <Alert severity="info">
        You are using a Self-Hosted version of Retrospected. In order to reset
        your password, ask your admin ({adminEmail}) to access the admin page to
        do that:&nbsp;
        <Link to="/admin">Admin Panel</Link>
      </Alert>
    );
  }

  return done ? (
    <Alert severity="success">{translations.doneMessage}</Alert>
  ) : (
    <Wrapper
      header={translations.header}
      actions={
        <Button
          onClick={handleForgotPassword}
          color="primary"
          autoFocus
          disabled={!email.length}
        >
          {translations.resetButton}
        </Button>
      }
    >
      <Alert severity="info">{translations.info}</Alert>

      <Input
        value={email}
        onChangeValue={setEmail}
        title={authTranslations.emailField}
        placeholder={authTranslations.emailField}
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
