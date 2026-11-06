import { useCallback, useState } from 'react';
import type { MouseEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { SessionMetadata } from 'common';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '../../../components/Avatar';
import { decrypt } from '../../../crypto/crypto';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import useFormatDate from '../../../hooks/useFormatDate';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { IconButton } from 'ui/icon-button';
import ItemStat from '../ItemStat';
import EncryptedLock from './EncryptedLock';
import PrivateSessionIcon from './PrivateSessionIcon';

interface PreviousGameItemProps {
  session: SessionMetadata;
  onClick: (session: SessionMetadata, encryptionKey: string | null) => void;
  onDelete: (session: SessionMetadata) => void;
}

const PreviousGameItem = ({
  session,
  onClick,
  onDelete,
}: PreviousGameItemProps) => {
  const { t } = useTranslation();
  const [encryptionKey] = useEncryptionKey(session.id);
  const formatDistanceToNow = useFormatDate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const sessionName =
    decrypt(session.name, encryptionKey) || t('SessionName.defaultSessionName');

  const handleClick = useCallback(() => {
    onClick(session, encryptionKey);
  }, [onClick, session, encryptionKey]);

  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    onDelete(session);
  }, [onDelete, session]);

  const handleOpenDialog = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      event.preventDefault();
      setDeleteDialogOpen(true);
    },
    [],
  );

  const handleCloseDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const people = session.participants.slice(0, 8);
  const extraPeople = session.participants.length - people.length;

  return (
    <>
      <article className="group relative flex flex-col rounded-3xl border border-line bg-cream p-4 shadow-card transition hover:border-primary-200">
        <button
          type="button"
          onClick={handleClick}
          className="flex flex-1 flex-col gap-3 text-left"
        >
          <div className="pr-8">
            <div className="flex items-start gap-2">
              <h3 className="min-w-0 flex-1 text-base leading-snug font-medium">
                {sessionName}
              </h3>
              <span className="flex shrink-0 items-center gap-1.5 pt-0.5">
                <EncryptedLock session={session} />
                <PrivateSessionIcon session={session} />
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {formatDistanceToNow(Date.parse(session.created), true)}
              <span className="ml-2 font-mono text-[10px] tracking-wide text-muted/70">
                {session.id}
              </span>
            </p>
          </div>
          <p className="text-xs text-muted">
            {t('PreviousGame.createdBy')} <em>{session.createdBy.name}</em>
          </p>
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {people.map((user) => (
                <CustomAvatar
                  user={user}
                  key={user.id}
                  className="size-7 ring-2 ring-cream"
                />
              ))}
              {extraPeople > 0 ? (
                <span className="inline-flex size-7 items-center justify-center rounded-full bg-paper text-[10px] font-medium text-muted ring-2 ring-cream">
                  +{extraPeople}
                </span>
              ) : null}
            </div>
            <span className="text-xs text-muted">
              {session.participants.length}{' '}
              {t('PreviousGame.participants', {
                count: session.participants.length,
              })}
            </span>
          </div>
          <div className="grid grid-cols-4 rounded-2xl bg-paper">
            <ItemStat
              value={session.numberOfPosts}
              label={t('PreviousGame.posts', { count: +session.numberOfPosts })}
              color="#4caf50"
            />
            <ItemStat
              value={session.participants.length}
              label={t('PreviousGame.participants', {
                count: session.participants.length,
              })}
              color="#3f51b5"
            />
            <ItemStat
              value={session.numberOfVotes}
              label={t('PreviousGame.votes', { count: +session.numberOfVotes })}
              color="#f44336"
            />
            <ItemStat
              value={session.numberOfActions}
              label={t('PreviousGame.actions', {
                count: +session.numberOfActions,
              })}
              color="#ffc107"
            />
          </div>
        </button>
        {session.canBeDeleted ? (
          <IconButton
            onClick={handleOpenDialog}
            aria-label={t('DeleteSession.header', { name: sessionName })}
            className="absolute top-2 right-2 z-10 text-red-600 opacity-100 sm:pointer-events-none sm:opacity-0 sm:group-hover:pointer-events-auto sm:group-hover:opacity-100 [@media(hover:none)]:pointer-events-auto [@media(hover:none)]:opacity-100"
          >
            <Trash2 className="size-4" />
          </IconButton>
        ) : null}
      </article>
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialog}>
        <DialogContent size="sm">
          <DialogTitle>
            {t('DeleteSession.header', { name: sessionName })}
          </DialogTitle>
          <DialogBody>
            <p className="text-sm leading-6 text-muted">
              {t('DeleteSession.firstLine')}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted">
              {t('DeleteSession.secondLine')}
            </p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              {t('DeleteSession.cancel')}
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              {t('DeleteSession.yesImSure')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PreviousGameItem;
