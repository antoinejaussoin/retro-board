import { LayoutDashboard, StickyNote, ThumbsUp, User } from 'lucide-react';
import {
  useCallback,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from 'react';
import { DeleteAccountPayload, FullUser } from 'common';
import { deleteAccount, deleteUser, logout } from '../../../api';
import { useNavigate } from 'react-router';
import { useConfirm } from 'ui/confirm';
import { useSnackbar } from 'ui/toast';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '../../../track';
import useUser from 'state/user/useUser';
import { useSetUser } from 'state/user/useSetUser';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { Button } from 'ui/button';
import { cn } from 'ui/cn';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';

type DeleteModalProps = {
  open: boolean;
  user: FullUser;
  onClose: () => void;
  onDelete?: (user: FullUser) => void;
};

export function DeleteModal({
  open,
  user,
  onClose,
  onDelete,
}: DeleteModalProps) {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [deleteSessions, setDeleteSessions] = useState(false);
  const [deletePosts, setDeletePosts] = useState(false);
  const [deleteVotes, setDeleteVotes] = useState(false);
  const currentUser = useUser();
  const isOwnAccount = currentUser && currentUser.id === user.id;
  const setUser = useSetUser();
  const { enqueueSnackbar } = useSnackbar();
  const push = useNavigate();
  const confirm = useConfirm();
  const { t } = useTranslation();

  const handleDelete = useCallback(async () => {
    if (!user) {
      return null;
    }
    const payload: DeleteAccountPayload = {
      deletePosts,
      deleteSessions,
      deleteVotes,
    };
    const buttonProps = {
      color: 'error',
      'data-cy': 'delete-modal-confirm',
    };
    confirm({
      title: t('AccountPage.deleteAccount.modal.confirm.title'),
      description: t('AccountPage.deleteAccount.modal.confirm.description'),
      confirmationText: t(
        'AccountPage.deleteAccount.modal.confirm.confirmation',
      ),
      cancellationText: t(
        'AccountPage.deleteAccount.modal.confirm.cancellation',
      ),
      confirmationButtonProps: buttonProps,
    })
      .then(async () => {
        trackEvent('account/gdpr/delete-account');
        if (isOwnAccount) {
          const success = await deleteAccount(payload);
          if (success) {
            logout();
            setUser(null);
            push('/');
          } else {
            enqueueSnackbar(
              'Deleting your account failed. Please contact support: support@retrospected.com',
              { variant: 'error' },
            );
            onClose();
          }
        } else {
          const success = await deleteUser(user, payload);
          if (success) {
            enqueueSnackbar(
              `User ${user.name} (${user.email}) has been deleted.`,
              { variant: 'success' },
            );
            if (onDelete) {
              onDelete(user);
            }
          } else {
            enqueueSnackbar('Deleting the account failed.', {
              variant: 'error',
            });
            onClose();
          }
        }
      })
      .catch(() => {
        onClose();
      });
  }, [
    isOwnAccount,
    user,
    deletePosts,
    deleteSessions,
    deleteVotes,
    push,
    setUser,
    confirm,
    onClose,
    onDelete,
    t,
    enqueueSnackbar,
  ]);

  if (!user) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent size="sm" fullScreen={fullScreen}>
        <DialogTitle>
          {t('AccountPage.deleteAccount.modal.subheader')}
        </DialogTitle>
        <DialogBody>
          <div className="flex flex-col">
            <DeleteItem checked disabled icon={<User className="size-5" />}>
              {t('AccountPage.deleteAccount.modal.deleteAccount')} ({user.email})
            </DeleteItem>
            <DeleteItem
              checked={deleteSessions}
              onToggle={setDeleteSessions}
              icon={<LayoutDashboard className="size-5" />}
              cy="delete-modal-sessions"
            >
              <p>{t('AccountPage.deleteAccount.modal.deleteSessions.main')}</p>
              {deleteSessions ? (
                <p className="text-red-700">
                  {t('AccountPage.deleteAccount.modal.deleteSessions.selected')}
                </p>
              ) : (
                <p className="text-emerald-700">
                  <b>{t('AccountPage.deleteAccount.modal.recommended')}</b> -{' '}
                  {t(
                    'AccountPage.deleteAccount.modal.deleteSessions.unselected',
                  )}
                </p>
              )}
            </DeleteItem>
            <DeleteItem
              checked={deletePosts}
              onToggle={setDeletePosts}
              icon={<StickyNote className="size-5" />}
              cy="delete-modal-posts"
            >
              <p>{t('AccountPage.deleteAccount.modal.deletePosts.main')}</p>
              {deletePosts ? (
                <p className="text-red-700">
                  {t('AccountPage.deleteAccount.modal.deletePosts.selected')}
                </p>
              ) : (
                <p className="text-emerald-700">
                  <b>{t('AccountPage.deleteAccount.modal.recommended')}</b> -{' '}
                  {t('AccountPage.deleteAccount.modal.deletePosts.unselected')}
                </p>
              )}
            </DeleteItem>
            <DeleteItem
              checked={deleteVotes}
              onToggle={setDeleteVotes}
              icon={<ThumbsUp className="size-5" />}
              cy="delete-modal-votes"
            >
              <p>{t('AccountPage.deleteAccount.modal.deleteVotes.main')}</p>
              {deleteVotes ? (
                <p className="text-red-700">
                  {t('AccountPage.deleteAccount.modal.deleteVotes.selected')}
                </p>
              ) : (
                <p className="text-emerald-700">
                  <b>{t('AccountPage.deleteAccount.modal.recommended')}</b> -{' '}
                  {t('AccountPage.deleteAccount.modal.deleteVotes.unselected')}
                </p>
              )}
            </DeleteItem>
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="danger"
            onClick={handleDelete}
            data-cy="delete-modal-delete-button"
          >
            {t('AccountPage.deleteAccount.modal.deleteAccountButton')}
          </Button>
          <Button variant="ghost" onClick={onClose}>
            {t('AccountPage.deleteAccount.modal.cancelButton')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

type DeleteItemProps = {
  disabled?: boolean;
  checked: boolean;
  icon: ReactNode;
  cy?: string;
  onToggle?: (value: boolean) => void;
};

function DeleteItem({
  children,
  disabled,
  icon,
  checked,
  cy,
  onToggle,
}: PropsWithChildren<DeleteItemProps>) {
  return (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-b-0">
      <span className="mt-0.5 text-muted">{icon}</span>
      <div className="min-w-0 flex-1 text-sm [&_p]:m-0">{children}</div>
      <Switch
        disabled={disabled}
        checked={checked}
        cy={cy}
        onCheckedChange={(value) => (onToggle ? onToggle(value) : undefined)}
      />
    </div>
  );
}

function Switch({
  checked,
  disabled,
  cy,
  onCheckedChange,
}: {
  checked: boolean;
  disabled?: boolean;
  cy?: string;
  onCheckedChange?: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      data-cy={cy}
      onClick={() => {
        if (onCheckedChange) {
          onCheckedChange(!checked);
        }
      }}
      className={cn(
        'relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50',
        checked ? 'bg-primary-700' : 'bg-stone-300',
      )}
    >
      <span
        className={cn(
          'inline-block size-5 rounded-full bg-cream shadow transition-transform',
          checked ? 'translate-x-5' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
