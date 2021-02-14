import { useState, useCallback, Suspense, lazy } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { resetChangePassword } from '../api';
import { Alert } from '@material-ui/lab';
import { useContext } from 'react';
import UserContext from '../auth/Context';
import Input from '../components/Input';
import { VpnKey } from '@material-ui/icons';
import { Button } from '@material-ui/core';
import useTranslations from '../translations';

const PasswordStrength = lazy(() => import('react-password-strength-bar'));

function ResetPasswordPage() {
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  const {
    ResetPassword: translations,
    AuthCommon: authTranslations,
  } = useTranslations();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const code = params.get('code');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [score, setScore] = useState(0);

  const validPassword = score >= 3;

  const handleChangePassword = useCallback(async () => {
    if (email && code) {
      const user = await resetChangePassword(email, password, code);
      setLoading(false);
      setSuccess(!!user);
      if (user) {
        setTimeout(() => {
          setUser(user);
          history.push('/');
        }, 2000);
      }
    } else {
      setLoading(false);
      setSuccess(false);
    }
  }, [email, code, history, password, setUser]);

  return (
    <div style={{ margin: 50 }}>
      {success === true && !loading ? (
        <Alert severity="success">{translations.success}</Alert>
      ) : null}
      {success === false && !loading ? (
        <Alert severity="error">{translations.error}</Alert>
      ) : null}
      {success === null && loading ? (
        <Alert severity="info">{translations.loading}</Alert>
      ) : null}
      {success === null && !loading ? (
        <>
          <Alert severity="info">{translations.resetInfo}</Alert>
          <Input
            value={password}
            onChangeValue={setPassword}
            title={authTranslations.passwordField}
            placeholder={authTranslations.passwordField}
            type="password"
            fullWidth
            style={{ marginTop: 20 }}
            leftIcon={<VpnKey />}
            required
          />
          <Suspense fallback={<span />}>
            <PasswordStrength
              onChangeScore={setScore}
              password={password}
              shortScoreWord={authTranslations.passwordScoreWords![0]}
              scoreWords={authTranslations.passwordScoreWords}
            />
          </Suspense>
          <Button
            onClick={handleChangePassword}
            disabled={!validPassword}
            variant="contained"
            color="primary"
          >
            {translations.resetButton}
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default ResetPasswordPage;
