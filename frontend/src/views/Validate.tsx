import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { emailFromQuery } from 'email/query';
import { verifyEmail } from '../api';
import { useSetUser } from 'state/user/useSetUser';
import { Alert } from 'ui/alert';

function ValidatePage() {
  const setUser = useSetUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const params = new URLSearchParams(location.search);
  const email = emailFromQuery(params.get('email'));
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
            navigate('/');
          }, 2000);
        }
      } else {
        setLoading(false);
        setSuccess(false);
      }
    }
    verify();
  }, [email, code, navigate, setUser]);

  return (
    <div className="flex justify-center bg-paper px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-cream p-6 text-ink shadow-card">
        {success && !loading ? (
          <Alert severity="success">{t('ValidateAccount.success')}</Alert>
        ) : null}
        {!success && !loading ? (
          <Alert severity="error">{t('ValidateAccount.error')}</Alert>
        ) : null}
        {loading ? (
          <Alert severity="info">{t('ValidateAccount.loading')}</Alert>
        ) : null}
      </div>
    </div>
  );
}

export default ValidatePage;
