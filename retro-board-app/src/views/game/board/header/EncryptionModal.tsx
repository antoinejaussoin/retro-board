import { useCallback, useEffect, useMemo, useState } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import styled from 'styled-components';
import { CHECK_PREFIX, decrypt } from '../../../../crypto/crypto';
import useGlobalState from '../../../../state';
import { Alert } from '@material-ui/lab';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import { useHistory, useLocation } from 'react-router-dom';
import deepPurple from '@material-ui/core/colors/deepPurple';
import useTranslation from '../../../../translations/useTranslations';

function EncryptionModal() {
  const [password, setPassword] = useState('');
  const { state } = useGlobalState();
  const storeKey = useEncryptionKey()[1];
  const history = useHistory();
  const location = useLocation();
  const { Encryption: translations } = useTranslation();
  const isCorrectPassword = useMemo(() => {
    if (state && state.session && state.session.encrypted) {
      return decrypt(state.session.encrypted, password) === CHECK_PREFIX;
    }
    return false;
  }, [password, state]);
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
  border: 1px solid ${deepPurple[900]};
  font-size: 2em;
`;

export default EncryptionModal;
