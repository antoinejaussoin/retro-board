import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { Alert } from '@mui/material';
import { useSnackbar } from 'notistack';
import { useCallback, useState } from 'react';
import { FullUser } from 'common';
import Input from '../../components/Input';
import { changePassword } from './api';
import { Key } from '@mui/icons-material';

type ChangePasswordProps = {
  user: FullUser;
};

export default function ChangePassword({ user }: ChangePasswordProps) {
  const [showModal, setShowModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const { enqueueSnackbar } = useSnackbar();
  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);
  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);
  const handlePasswordChange = useCallback(async () => {
    setShowModal(false);
    const result = await changePassword(user.id, newPassword);
    if (result) {
      enqueueSnackbar('Password successfully changed', { variant: 'success' });
    } else {
      enqueueSnackbar('There was a problem while changing the password', {
        variant: 'error',
      });
    }
    setNewPassword('');
  }, [enqueueSnackbar, user, newPassword]);
  return (
    <>
      <Button onClick={handleOpenModal} startIcon={<Key />}>
        Change Password
      </Button>
      <Dialog onClose={handleCloseModal} open={showModal}>
        <DialogTitle>Change password for {user.email}</DialogTitle>
        <Alert severity="warning">
          You are about to change the password for user {user.name} (
          {user.email}). Please make sure the user is happy with that.
        </Alert>

        <DialogContent>
          <Input
            type="password"
            value={newPassword}
            onChangeValue={setNewPassword}
            placeholder="New password"
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button
            style={{ backgroundColor: colors.red[500], color: 'white' }}
            onClick={handlePasswordChange}
            disabled={!newPassword}
          >
            Change Password
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
