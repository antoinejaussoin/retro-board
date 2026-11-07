import { KeyRound } from 'lucide-react';
import { useState, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { resetChangePassword } from '../api';
import Input from '../components/Input';
import { useSetUser } from 'state/user/useSetUser';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';

const PasswordStrength = lazy(() => import('react-password-strength-bar'));

function ResetPasswordPage() {
  const setUser = useSetUser();
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
    <div className="flex justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-6 text-ink shadow-card">
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
          <div className="flex flex-col gap-4">
            <Alert severity="info">{t('ResetPassword.resetInfo')}</Alert>
            <Input
              value={password}
              onChangeValue={setPassword}
              title={t('AuthCommon.passwordField')!}
              placeholder={t('AuthCommon.passwordField')!}
              type="password"
              fullWidth
              leftIcon={<KeyRound className="size-4" />}
              required
            />
            <Suspense fallback={<span />}>
              <PasswordStrength
                onChangeScore={setScore}
                password={password}
                shortScoreWord={
                  (
                    t('AuthCommon.passwordScoreWords', {
                      returnObjects: true,
                    }) as string[]
                  )[0]
                }
                scoreWords={
                  t('AuthCommon.passwordScoreWords', {
                    returnObjects: true,
                  }) as string[]
                }
              />
            </Suspense>
            <div className="flex justify-end">
              <Button onClick={handleChangePassword} disabled={!validPassword}>
                {t('ResetPassword.resetButton')}
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default ResetPasswordPage;
