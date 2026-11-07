import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Alert } from 'ui/alert';
import { Dialog, DialogBody, DialogContent, DialogTitle } from 'ui/dialog';
import { CHECK_PREFIX, decrypt } from '../../../../crypto/crypto';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import useSession from '../../useSession';

function EncryptionModal() {
  const [password, setPassword] = useState('');
  const { session } = useSession();
  const storeKey = useEncryptionKey()[1];
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const isCorrectPassword = useMemo(() => {
    if (session && session.encrypted) {
      return decrypt(session.encrypted, password) === CHECK_PREFIX;
    }
    return false;
  }, [password, session]);
  const handlePassword = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(event.target.value);
    },
    [],
  );
  useEffect(() => {
    if (isCorrectPassword) {
      storeKey(password);
      navigate(location.pathname + '#' + password);
    }
  }, [isCorrectPassword, password, storeKey, location, navigate]);
  return (
    <Dialog open onClose={() => undefined}>
      <DialogContent size="sm" hideClose>
        <DialogTitle>{t('Encryption.passwordModalTitle')}</DialogTitle>
        <DialogBody>
          <div className="flex justify-center">
            <input
              value={password}
              onChange={handlePassword}
              className="w-56 rounded-xl border border-primary-900 bg-cream px-3 py-2 text-center text-2xl text-ink outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>
          {!isCorrectPassword && password.length ? (
            <Alert severity="warning" className="mt-4">
              {t('Encryption.passwordModelIncorrect')}
            </Alert>
          ) : null}
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}

export default EncryptionModal;
