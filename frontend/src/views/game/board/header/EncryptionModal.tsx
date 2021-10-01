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
import { useHistory, useLocation } from 'react-router-dom';
import { colors } from '@mui/material';
import useTranslation from '../../../../translations/useTranslations';
import useSession from '../../useSession';

function EncryptionModal() {
  const [password, setPassword] = useState('');
  const { session } = useSession();
  const storeKey = useEncryptionKey()[1];
  const history = useHistory();
  const location = useLocation();
  const { Encryption: translations } = useTranslation();
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
      history.push(location.pathname + '#' + password);
    }
  }, [isCorrectPassword, password, storeKey, location, history]);
  return (
    <Dialog open>
      <DialogTitle>{translations.passwordModalTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <Input value={password} onChange={handlePassword} />
        </DialogContentText>
        {!isCorrectPassword && password.length ? (
          <DialogContentText>
            <Alert severity="warning">
              {translations.passwordModelIncorrect}
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
  border: 1px solid ${colors.deepPurple[900]};
  font-size: 2em;
`;

export default EncryptionModal;
