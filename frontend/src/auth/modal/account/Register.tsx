import {
  Suspense,
  useCallback,
  useState,
  useMemo,
  lazy,
  useContext,
} from 'react';
import Button from '@mui/material/Button';
import { Alert } from '@mui/material';
import useTranslations, { useLanguage } from '../../../translations';
import Wrapper from './../Wrapper';
import Input from '../../../components/Input';
import { Person, Email, VpnKey } from '@mui/icons-material';
import { register } from '../../../api';
import { validate } from 'isemail';
import UserContext from '../../Context';

type RegisterProps = {
  onClose: () => void;
};

const PasswordStrength = lazy(
  () =>
    import(
      'react-password-strength-bar' /* webpackChunkName: "password-strength" */
    )
);

const Register = ({ onClose }: RegisterProps) => {
  const { Register: translations, AuthCommon: authTranslations } =
    useTranslations();
  const language = useLanguage();
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [passwordScore, setPasswordScore] = useState(0);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const { setUser } = useContext(UserContext);

  const validEmail = useMemo(() => {
    return validate(registerEmail);
  }, [registerEmail]);

  const validName = registerName.length > 3;

  const handleRegistration = useCallback(async () => {
    const response = await register(
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
    } else {
      setIsSuccessful(true);
      if (response.loggedIn) {
        setUser(response.user);
        onClose();
      }
    }
  }, [
    registerName,
    registerEmail,
    registerPassword,
    language.value,
    translations,
    setUser,
    onClose,
  ]);

  return (
    <Wrapper
      header={translations.header}
      actions={
        !isSuccessful ? (
          <Button
            onClick={handleRegistration}
            color="primary"
            autoFocus
            disabled={!validEmail || passwordScore < 3 || !validName}
          >
            {translations.registerButton}
          </Button>
        ) : undefined
      }
    >
      {isSuccessful ? (
        <Alert severity="success">{translations.messageSuccess}</Alert>
      ) : (
        <>
          <Alert severity="info">{translations.info}</Alert>

          {!!generalError ? (
            <Alert severity="error" style={{ marginTop: 10 }}>
              {generalError}
            </Alert>
          ) : null}

          <Input
            value={registerName}
            onChangeValue={setRegisterName}
            title={authTranslations.nameField}
            placeholder={authTranslations.nameField}
            variant="standard"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<Person />}
            required
          />
          <Input
            value={registerEmail}
            onChangeValue={setRegisterEmail}
            title={authTranslations.emailField}
            placeholder={authTranslations.emailField}
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
            title={authTranslations.passwordField}
            placeholder={authTranslations.passwordField}
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
    </Wrapper>
  );
};

export default Register;
