import { Suspense, useCallback, useState, useMemo, lazy } from 'react';
import Button from '@mui/material/Button';
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import useTranslations, { useLanguage } from '../../translations';
import Input from '../../components/Input';
import { Person, Email, VpnKey } from '@mui/icons-material';
import { addUser } from '../../api';
import { validate } from 'isemail';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { FullUser } from 'common';

type NewAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (user: FullUser) => void;
};

const PasswordStrength = lazy(
  () =>
    import(
      'react-password-strength-bar' /* webpackChunkName: "password-strength" */
    )
);

export function NewAccountModal({
  open,
  onAdd,
  onClose,
}: NewAccountModalProps) {
  const { Register: translations, AuthCommon: authTranslations } =
    useTranslations();
  const language = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const { disablePasswordRegistration } = useBackendCapabilities();

  const validEmail = useMemo(() => {
    return validate(registerEmail);
  }, [registerEmail]);

  const validName = registerName.length > 3;

  const handleRegistration = useCallback(async () => {
    const response = await addUser(
      registerName,
      registerEmail,
      registerPassword,
      language.value
    );
    if (response.error) {
      switch (response.error) {
        case 'already-exists':
          setGeneralError(translations.errorAlreadyRegistered!);
          return;
        default:
          setGeneralError(translations.errorGeneral!);
          return;
      }
    } else if (response.user) {
      setIsSuccessful(true);
      onAdd(response.user);
    } else {
      setIsSuccessful(false);
    }
  }, [
    registerName,
    registerEmail,
    registerPassword,
    language.value,
    translations,

    onAdd,
  ]);

  if (disablePasswordRegistration) {
    return (
      <Alert severity="error">
        Registration is disabled by your administrator. Ask your administrator
        to create an account for you.
      </Alert>
    );
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Create a new user</DialogTitle>
      <DialogContent>
        {isSuccessful ? (
          <Alert severity="success">{translations.messageSuccess}</Alert>
        ) : (
          <>
            {!!generalError ? (
              <Alert severity="error" style={{ marginTop: 10 }}>
                {generalError}
              </Alert>
            ) : null}

            <Input
              value={registerName}
              onChangeValue={setRegisterName}
              title="Your user's name (i.e. John Doe)"
              placeholder="John Doe"
              variant="standard"
              fullWidth
              style={{ marginTop: 20 }}
              leftIcon={<Person />}
              required
            />
            <Input
              value={registerEmail}
              onChangeValue={setRegisterEmail}
              title="Your user's email"
              placeholder="john.doe@acme.com"
              variant="standard"
              fullWidth
              style={{ marginTop: 20 }}
              leftIcon={<Email />}
              required
              error={!validEmail && registerEmail.length > 0}
              helperText={
                !validEmail && registerEmail.length > 0
                  ? translations.errorInvalidEmail
                  : undefined
              }
            />
            <Input
              value={registerPassword}
              onChangeValue={setRegisterPassword}
              title="Your user's password"
              placeholder="P@ssw0rd"
              variant="standard"
              type="password"
              fullWidth
              style={{ marginTop: 20 }}
              leftIcon={<VpnKey />}
              required
            />
            <Suspense fallback={<span />}>
              <PasswordStrength
                onChangeScore={setPasswordScore}
                password={registerPassword}
                shortScoreWord={authTranslations.passwordScoreWords![0]}
                scoreWords={authTranslations.passwordScoreWords}
              />
            </Suspense>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Close
        </Button>
        {!isSuccessful ? (
          <Button
            onClick={handleRegistration}
            color="primary"
            autoFocus
            disabled={!validEmail || passwordScore < 3 || !validName}
          >
            Add User
          </Button>
        ) : undefined}
      </DialogActions>
    </Dialog>
  );
}
