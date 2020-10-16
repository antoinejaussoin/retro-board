import React, { useCallback, useState } from 'react';
import { Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import useTranslations from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Email } from '@material-ui/icons';
import { resetPassword } from '../../../api';

const LostPassword = () => {
  const {
    ResetPassword: translations,
    AuthCommon: authTranslations,
  } = useTranslations();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const handleForgotPassword = useCallback(() => {
    async function reset() {
      await resetPassword(email);
      setDone(true);
    }
    reset();
  }, [email]);

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
        fullWidth
        style={{ marginTop: 20 }}
        leftIcon={<Email />}
      />
    </Wrapper>
  );
};

export default LostPassword;
