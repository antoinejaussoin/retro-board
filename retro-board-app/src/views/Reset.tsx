import React, { useState, useCallback, Suspense } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { resetChangePassword } from '../api';
import { Alert } from '@material-ui/lab';
import { useContext } from 'react';
import UserContext from '../auth/Context';
import Input from '../components/Input';
import { VpnKey } from '@material-ui/icons';
import { Button } from '@material-ui/core';

const PasswordStrength = React.lazy(
  () => import('react-password-strength-bar')
);

const scoreWords = ['weak', 'weak', 'not quite', 'good', 'strong'];

function ResetPasswordPage() {
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
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
        <Alert severity="success">
          Your password has been updated. I'm going to log you in in a sec!
        </Alert>
      ) : null}
      {success === false && !loading ? (
        <Alert severity="error">
          There was an error updating your password.
        </Alert>
      ) : null}
      {success === null && loading ? (
        <Alert severity="info">
          We are updating your password. Please wait.
        </Alert>
      ) : null}
      {success === null && !loading ? (
        <>
          <Alert severity="info">Please provide a new password</Alert>
          <Input
            value={password}
            onChangeValue={setPassword}
            title="Password"
            placeholder="Password"
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
              scoreWords={scoreWords}
            />
          </Suspense>
          <Button onClick={handleChangePassword} disabled={!validPassword}>
            Update Password
          </Button>
        </>
      ) : null}
    </div>
  );
}

export default ResetPasswordPage;
