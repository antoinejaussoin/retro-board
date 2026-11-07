import { Lock, LockOpen } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CustomAvatar from '../../../../components/Avatar';
import ProButton from '../../../../components/ProButton';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { IconButton } from 'ui/icon-button';
import { useSnackbar } from 'ui/toast';
import useParticipants from '../../useParticipants';
import useSession from '../../useSession';

interface LockSessionProps {
  onLock(locked: boolean): void;
}

function LockSession({ onLock }: LockSessionProps) {
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { t } = useTranslation();
  const { participants } = useParticipants();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const small = useMediaQuery('(max-width: 500px)');

  const handleLock = useCallback(() => {
    if (session) {
      onLock(!session.locked);
      enqueueSnackbar(
        session.locked
          ? t('Private.unlockSuccessNotification')
          : t('Private.lockSuccessNotification'),
        { variant: 'success' },
      );
    }
    setOpen(false);
  }, [session, onLock, enqueueSnackbar, t]);

  const handleOpenDialog = useCallback(() => {
    if (session && !session.locked) {
      setOpen(true);
    } else {
      handleLock();
    }
  }, [session, handleLock]);

  const handleCloseDialog = useCallback(() => {
    setOpen(false);
  }, []);

  if (!session) {
    return null;
  }

  const icon = session.locked ? (
    <Lock className="size-4 text-red-800" />
  ) : (
    <LockOpen className="size-4 text-emerald-800" />
  );

  return (
    <>
      <ProButton>
        {small ? (
          <IconButton
            onClick={handleOpenDialog}
            aria-label={
              session.locked
                ? t('Private.unlockButton')
                : t('Private.lockButton')
            }
          >
            {session.locked ? (
              <Lock className="size-5 text-red-800" />
            ) : (
              <LockOpen className="size-5 text-emerald-800" />
            )}
          </IconButton>
        ) : (
          <Button variant="outline" size="sm" onClick={handleOpenDialog}>
            {icon}
            {session.locked
              ? t('Private.unlockButton')
              : t('Private.lockButton')}
          </Button>
        )}
      </ProButton>
      <Dialog onClose={handleCloseDialog} open={open}>
        <DialogContent fullScreen={fullScreen} size="md">
          <DialogTitle>
            <span className="inline-flex items-center gap-2">
              <Lock className="size-5" />
              {t('Private.lockButton')}
            </span>
          </DialogTitle>
          <DialogBody>
            <p className="text-sm leading-6 text-muted">
              {t('Private.lockDescription')}
            </p>
            <div className="mt-4 flex flex-wrap">
              {participants.map((player) => (
                <div
                  key={player.id}
                  className="flex min-w-[150px] flex-1 flex-col p-2.5"
                >
                  <div className="flex justify-center">
                    <CustomAvatar user={player} />
                  </div>
                  <div className="mt-2.5 text-center text-stone-600">
                    {player.name}
                  </div>
                </div>
              ))}
            </div>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              {t('Private.cancelButton')}
            </Button>
            <Button onClick={handleLock}>{t('Private.lockButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default LockSession;
