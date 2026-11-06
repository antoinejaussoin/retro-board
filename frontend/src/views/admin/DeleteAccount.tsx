import { Trash2 } from 'lucide-react';
import { FullUser } from 'common';
import useModal from 'hooks/useModal';
import { useCallback } from 'react';
import { Button } from 'ui/button';
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
    [onDelete, handleDeleteClose],
  );

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-red-700"
        onClick={handleDeleteOpen}
      >
        <Trash2 className="size-4" />
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
