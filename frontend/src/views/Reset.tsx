import { useState, useCallback, Suspense, lazy } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetChangePassword } from '../api';
import { Alert } from '@mui/material';
import { useContext } from 'react';
import UserContext from '../auth/Context';
import Input from '../components/Input';
import { VpnKey } from '@mui/icons-material';
import Button from '@mui/material/Button';
import { useTranslation } from 'react-i18next';

const PasswordStrength = lazy(() => import('react-password-strength-bar'));

function ResetPasswordPage() {
  const { setUser } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
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
          navigate('/');
        }, 2000);
      }
    } else {
      setLoading(false);
      setSuccess(false);
    }
  }, [email, code, navigate, password, setUser]);

  return (
    <div style={{ margin: 50 }}>
      {success === true && !loading ? (
        <Alert severity="success">{t('ResetPassword.success')}</Alert>
      ) : null}
      {success === false && !loading ? (
        <Alert severity="error">{t('ResetPassword.error')}</Alert>
      ) : null}
      {success === null && loading ? (
        <Alert severity="info">{t('ResetPassword.loading')}</Alert>
      ) : null}
      {success === null && !loading ? (
        <>
          <Alert severity="info">{t('ResetPassword.resetInfo')}</Alert>
          <Input
            value={password}
            onChangeValue={setPassword}
            title={t('AuthCommon.passwordField')}
            placeholder={t('AuthCommon.passwordField')}
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
              shortScoreWord={t('AuthCommon.passwordScoreWords')![0]}
              scoreWords={t('AuthCommon.passwordScoreWords')}
            />
          </Suspense>
          <Button
            onClick={handleChangePassword}
            disabled={!validPassword}
            variant="contained"
            color="primary"
          >
            {t('ResetPassword.resetButton')}
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default ResetPasswordPage;
