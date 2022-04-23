import { Delete } from '@mui/icons-material';
import { Button } from '@mui/material';
import { FullUser } from 'common';
import useModal from 'hooks/useModal';
import { useCallback } from 'react';
import { DeleteModal } from 'views/account/delete/DeleteModal';

type DeleteAccountProps = {
  user: FullUser;
  onDelete: (user: FullUser) => void;
};

export function DeleteAccount({ user, onDelete }: DeleteAccountProps) {
  const [deleteOpened, handleDeleteOpen, handleDeleteClose] = useModal();

  const handleDelete = useCallback(
    (user: FullUser) => {
      onDelete(user);
      handleDeleteClose();
    },
    [onDelete, handleDeleteClose]
  );

  return (
    <>
      <Button color="error" startIcon={<Delete />} onClick={handleDeleteOpen}>
        Delete
      </Button>
      <DeleteModal
        open={deleteOpened}
        user={user}
        onDelete={handleDelete}
        onClose={handleDeleteClose}
      />
    </>
  );
}
