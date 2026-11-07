import { SessionOptions, SessionSettings } from 'common';
import ClosableAlert from 'components/ClosableAlert';
import { memo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useShouldLockSession } from 'views/game/useTimer';
import EditableLabel from '../../../../components/EditableLabel';
import TransitionAlert from '../../../../components/TransitionAlert';
import useCanDecrypt from '../../../../crypto/useCanDecrypt';
import useCrypto from '../../../../crypto/useCrypto';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import useIsDisabled from '../../../../hooks/useIsDisabled';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import useUser from '../../../../state/user/useUser';
import useSession from '../../useSession';
import useSessionUserPermissions from '../useSessionUserPermissions';
import EncryptionModal from './EncryptionModal';
import LockSession from './LockSession';
import ModifyOptions from './ModifyOptions';
import RemainingVotes from './RemainingVotes';
import RevealButton from './RevealButton';
import useCanModifyOptions from './useCanModifyOptions';
import useCanReveal from './useCanReveal';
import useRemainingVotes from './useRemainingVotes';
import useShouldDisplayEncryptionWarning from './useShouldDisplayEncryptionWarning';

interface BoardHeaderProps {
  onChangeSession: (session: SessionSettings, saveAsTemplate: boolean) => void;
  onLockSession: (locked: boolean) => void;
}

function BoardHeader({ onChangeSession, onLockSession }: BoardHeaderProps) {
  const { t } = useTranslation();
  const [key] = useEncryptionKey();
  const remainingVotes = useRemainingVotes();
  const user = useUser();
  const isLoggedIn = !!user;
  const canReveal = useCanReveal();
  const canModifyOptions = useCanModifyOptions();
  const { encrypt, decrypt } = useCrypto();
  const canDecrypt = useCanDecrypt();
  const isDisabled = useIsDisabled();
  const shouldDisplayEncryptionWarning = useShouldDisplayEncryptionWarning();
  const { session } = useSession();
  const permissions = useSessionUserPermissions();
  const locked = useShouldLockSession();
  const compact = useMediaQuery('(max-width: 720px)');

  const handleReveal = useCallback(() => {
    if (session) {
      const modifiedOptions: SessionOptions = {
        ...session.options,
        blurCards: false,
      };
      onChangeSession({ ...session, options: modifiedOptions }, false);
    }
  }, [onChangeSession, session]);

  const handleRenameSession = useCallback(
    (name: string) => {
      if (session) {
        onChangeSession(
          {
            name: encrypt(name),
          },
          false,
        );
      }
    },
    [onChangeSession, encrypt, session],
  );

  if (!session) {
    return <span>Loading...</span>;
  }

  const showVotes = remainingVotes.up !== null || remainingVotes.down !== null;
  const template = compact
    ? {
        columns: '1fr auto 1fr',
        areas: '"title title title" "left votes right"',
      }
    : {
        columns: 'auto minmax(0, 1fr) auto',
        areas: '"left title right"',
      };

  return (
    <>
      {!canDecrypt ? <EncryptionModal /> : null}
      <div className="flex flex-col gap-2.5">
        {!isLoggedIn ? (
          <ClosableAlert severity="warning">
            {t('PostBoard.notLoggedIn')}
          </ClosableAlert>
        ) : null}
        {!canDecrypt ? (
          <ClosableAlert severity="error">
            {t('Encryption.sessionEncryptionError')}
          </ClosableAlert>
        ) : null}
        {permissions.hasReachedMaxPosts ? (
          <ClosableAlert severity="warning" closable>
            {t('PostBoard.maxPostsReached')}
          </ClosableAlert>
        ) : null}
        {isDisabled ? (
          <ClosableAlert
            severity="warning"
            title={t('TrialPrompt.allowanceReachedTitle')}
          >
            {t('TrialPrompt.allowanceReachedDescription')}
          </ClosableAlert>
        ) : null}
        {locked ? (
          <ClosableAlert
            severity="info"
            title={t('PostBoard.lockedTitle')}
            closable
          >
            {t('PostBoard.lockedDescription')}
          </ClosableAlert>
        ) : null}
      </div>
      <div
        className="grid items-center gap-x-3 gap-y-1.5"
        style={{
          gridTemplateColumns: template.columns,
          gridTemplateAreas: template.areas,
        }}
      >
        <div
          style={{ gridArea: 'left' }}
          className="flex items-center justify-self-start gap-2"
        >
          {canReveal ? <RevealButton onClick={handleReveal} /> : null}
          {canModifyOptions ? (
            <ModifyOptions
              onChange={onChangeSession}
              owner={session.createdBy}
              settings={session}
            />
          ) : null}
        </div>
        <div
          style={{ gridArea: 'title' }}
          className="flex w-full min-w-0 justify-center justify-self-stretch"
        >
          <h1 className="w-full text-center text-xl font-light leading-tight">
            <EditableLabel
              wrapText
              placeholder={t('SessionName.defaultSessionName')!}
              value={decrypt(session.name)}
              centered
              onChange={handleRenameSession}
              readOnly={!isLoggedIn || !canDecrypt || !permissions.canEditTitle}
            />
          </h1>
        </div>
        <div
          style={{ gridArea: 'right' }}
          className="flex items-center justify-self-end gap-8"
        >
          {!compact && showVotes ? (
            <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
          ) : null}
          {canModifyOptions ? <LockSession onLock={onLockSession} /> : null}
        </div>
        {compact ? (
          <div style={{ gridArea: 'votes' }} className="flex justify-center">
            {showVotes ? (
              <RemainingVotes
                up={remainingVotes.up}
                down={remainingVotes.down}
              />
            ) : null}
          </div>
        ) : null}
      </div>
      {shouldDisplayEncryptionWarning ? (
        <TransitionAlert
          severity="warning"
          title={t('Encryption.newEncryptedSessionWarningTitle')!}
        >
          {t('Encryption.newEncryptedSessionWarningContent', {
            key: key || '(unknown)',
          })}
        </TransitionAlert>
      ) : null}
    </>
  );
}

export default memo(BoardHeader);
