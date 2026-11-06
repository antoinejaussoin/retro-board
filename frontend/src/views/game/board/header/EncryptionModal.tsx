import { useCallback, useEffect, useMemo, useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import styled from '@emotion/styled';
import { CHECK_PREFIX, decrypt } from '../../../../crypto/crypto';
import { Alert } from '@mui/material';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import { useNavigate, useLocation } from 'react-router-dom';
import useSession from '../../useSession';
import { useTranslation } from 'react-i18next';

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
    []
  );
  useEffect(() => {
    if (isCorrectPassword) {
      storeKey(password);
      navigate(location.pathname + '#' + password);
    }
  }, [isCorrectPassword, password, storeKey, location, navigate]);
  return (
    <Dialog open>
      <DialogTitle>{t('Encryption.passwordModalTitle')}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Input value={password} onChange={handlePassword} />
        </DialogContentText>
        {!isCorrectPassword && password.length ? (
          <DialogContentText>
            <Alert severity="warning">
              {t('Encryption.passwordModelIncorrect')}
            </Alert>
          </DialogContentText>
        ) : null}
      </DialogContent>
      <DialogActions></DialogActions>
    </Dialog>
  );
}

const Input = styled.input`
  text-align: center;
  border: 1px solid var(--rs-accent);
  border-radius: 8px;
  font-size: 2em;
`;

export default EncryptionModal;
