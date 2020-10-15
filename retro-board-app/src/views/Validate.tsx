import React, { useState } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import { useEffect } from 'react';
import { verifyEmail } from '../api';
import { Alert } from '@material-ui/lab';
import { useContext } from 'react';
import UserContext from '../auth/Context';

function ValidatePage() {
  const { setUser } = useContext(UserContext);
  const history = useHistory();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const email = params.get('email');
  const code = params.get('code');

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function verify() {
      if (email && code) {
        const result = await verifyEmail(email, code);
        setLoading(false);
        setSuccess(!!result);
        if (result) {
          setTimeout(() => {
            setUser(result);
            history.push('/');
          }, 2000);
        }
      } else {
        setLoading(false);
        setSuccess(false);
      }
    }
    verify();
  }, [email, code, history, setUser]);

  return (
    <div style={{ margin: 50 }}>
      {success && !loading ? (
        <Alert severity="success">
          Your email has been correctly validated. I'm going to log you in in a
          sec!
        </Alert>
      ) : null}
      {!success && !loading ? (
        <Alert severity="error">
          There was an error validating your email.
        </Alert>
      ) : null}
      {loading ? (
        <Alert severity="info">
          We are validating your email. Please wait.
        </Alert>
      ) : null}
    </div>
  );
}

export default ValidatePage;
