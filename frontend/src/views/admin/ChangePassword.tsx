import { KeyRound } from 'lucide-react';
import { useCallback, useState } from 'react';
import { FullUser } from 'common';
import Input from '../../components/Input';
import { changePassword } from './api';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { useSnackbar } from 'ui/toast';

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
      <Button variant="ghost" size="sm" onClick={handleOpenModal}>
        <KeyRound className="size-4" />
        Change Password
      </Button>
      <Dialog onClose={handleCloseModal} open={showModal}>
        <DialogContent size="sm">
          <DialogTitle>Change password for {user.email}</DialogTitle>
          <DialogBody className="flex flex-col gap-4">
            <Alert severity="warning">
              You are about to change the password for user {user.name} (
              {user.email}). Please make sure the user is happy with that.
            </Alert>
            <Input
              type="password"
              value={newPassword}
              onChangeValue={setNewPassword}
              placeholder="New password"
              fullWidth
            />
          </DialogBody>
          <DialogFooter>
            <Button
              variant="danger"
              onClick={handlePasswordChange}
              disabled={!newPassword}
            >
              Change Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
