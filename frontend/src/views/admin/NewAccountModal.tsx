import { Mail, User, KeyRound } from 'lucide-react';
import { Suspense, useCallback, useState, useMemo, lazy } from 'react';
import { useLanguage } from '../../translations';
import Input from '../../components/Input';
import { addUser } from '../../api';
import { validate } from 'email/validate';
import useBackendCapabilities from 'global/useBackendCapabilities';
import { FullUser } from 'common';
import { useTranslation } from 'react-i18next';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';

type NewAccountModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (user: FullUser) => void;
};

const PasswordStrength = lazy(() => import('react-password-strength-bar'));

export function NewAccountModal({
  open,
  onAdd,
  onClose,
}: NewAccountModalProps) {
  const { t } = useTranslation();
  const [language] = useLanguage();
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
      language.locale,
    );
    if (response.error) {
      switch (response.error) {
        case 'already-exists':
          setGeneralError(t('Register.errorAlreadyRegistered')!);
          return;
        default:
          setGeneralError(t('Register.errorGeneral')!);
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
    language.locale,
    t,
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

  const emailInvalid = !validEmail && registerEmail.length > 0;

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent size="md">
        <DialogTitle>Create a new user</DialogTitle>
        <DialogBody>
          {isSuccessful ? (
            <Alert severity="success">{t('Register.messageSuccess')}</Alert>
          ) : (
            <div className="flex flex-col gap-4">
              {generalError ? (
                <Alert severity="error">{generalError}</Alert>
              ) : null}

              <Input
                value={registerName}
                onChangeValue={setRegisterName}
                title="Your user's name (i.e. John Doe)"
                placeholder="John Doe"
                fullWidth
                leftIcon={<User className="size-4" />}
                required
              />
              <div>
                <Input
                  value={registerEmail}
                  onChangeValue={setRegisterEmail}
                  title="Your user's email"
                  placeholder="john.doe@acme.com"
                  fullWidth
                  leftIcon={<Mail className="size-4" />}
                  required
                  aria-invalid={emailInvalid}
                  className={emailInvalid ? 'border-red-400' : undefined}
                />
                {emailInvalid ? (
                  <p className="mt-1 text-sm text-red-700">
                    {t('Register.errorInvalidEmail')}
                  </p>
                ) : null}
              </div>
              <Input
                value={registerPassword}
                onChangeValue={setRegisterPassword}
                title="Your user's password"
                placeholder="P@ssw0rd"
                type="password"
                fullWidth
                leftIcon={<KeyRound className="size-4" />}
                required
              />
              <Suspense fallback={<span />}>
                <PasswordStrength
                  onChangeScore={setPasswordScore}
                  password={registerPassword}
                  shortScoreWord={t('AuthCommon.passwordScoreWords')[0]}
                  scoreWords={
                    t('AuthCommon.passwordScoreWords', {
                      returnObjects: true,
                    }) as string[]
                  }
                />
              </Suspense>
            </div>
          )}
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {!isSuccessful ? (
            <Button
              onClick={handleRegistration}
              autoFocus
              disabled={!validEmail || passwordScore < 3 || !validName}
            >
              Add User
            </Button>
          ) : undefined}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
