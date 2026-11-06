import { FullUser } from 'common';
import { useEffect, useState } from 'react';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { cn } from 'ui/cn';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { useSnackbar } from 'ui/toast';

type MergeModalProps = {
  users: FullUser[];
  open: boolean;
  onClose: () => void;
  onMerge: (into: FullUser, merged: FullUser[]) => void;
};

export default function MergeModal({
  users,
  open,
  onClose,
  onMerge,
}: MergeModalProps) {
  const [main, setMain] = useState<FullUser | null>(null);
  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    setMain(null);
  }, [users]);

  return (
    <Dialog onClose={onClose} open={open}>
      <DialogContent size="md">
        <DialogTitle>Merge Users</DialogTitle>
        <DialogBody className="flex flex-col gap-4">
          <Alert severity="warning">
            You are about to merge users. This cannot be undone. Be very
            careful.
          </Alert>
          <div>
            <p className="mb-2 text-sm font-medium">
              Choose the user to merge into:
            </p>
            <ul className="overflow-hidden rounded-2xl border border-line">
              {users.map((u) => {
                const selected = main?.id === u.id;
                return (
                  <li key={u.id} className="border-t border-line first:border-t-0">
                    <button
                      type="button"
                      className={cn(
                        'flex w-full flex-col px-4 py-3 text-left hover:bg-paper',
                        selected && 'bg-primary-50',
                      )}
                      onClick={() => {
                        if (u.accountType !== 'anonymous') {
                          setMain(u);
                        } else {
                          enqueueSnackbar(
                            'You cannot merge into an anonymous account. Please select another account.',
                            { variant: 'error' },
                          );
                        }
                      }}
                    >
                      <span className="text-sm">
                        {`${u.name}${u.email ? ` (${u.email})` : ''}`}
                      </span>
                      <span className="text-xs text-muted">{u.accountType}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
          {main ? (
            <Alert severity="info">
              You are going to merge all users in this list into{' '}
              <b>
                {main.name} ({main.email})
              </b>
              .<br />
              This means <b>all users in this list will be deleted</b>,{' '}
              <b>except</b> {main.email}, and all their dashboards, posts, votes
              etc. transferred to {main.email}.
            </Alert>
          ) : null}
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              if (main) {
                onMerge(
                  main,
                  users.filter((u) => u.id !== main.id),
                );
              }
            }}
          >
            Merge{main ? ` ${users.length - 1} users into ${main.name}` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
