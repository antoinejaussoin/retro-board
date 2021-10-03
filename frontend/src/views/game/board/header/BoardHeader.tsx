import { useCallback } from 'react';
import styled from '@emotion/styled';
import { SessionOptions, ColumnDefinition } from '@retrospected/common';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import useTranslations from '../../../../translations';
import useRemainingVotes from './useRemainingVotes';
import useCanReveal from './useCanReveal';
import EditableLabel from '../../../../components/EditableLabel';
import RemainingVotes from './RemainingVotes';
import useUser from '../../../../auth/useUser';
import { Alert, AlertTitle } from '@mui/material';
import RevealButton from './RevealButton';
import ModifyOptions from './ModifyOptions';
import useCanModifyOptions from './useCanModifyOptions';
import useCrypto from '../../../../crypto/useCrypto';
import useCanDecrypt from '../../../../crypto/useCanDecrypt';
import EncryptionModal from './EncryptionModal';
import useShouldDisplayEncryptionWarning from './useShouldDisplayEncryptionWarning';
import TransitionAlert from '../../../../components/TransitionAlert';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import LockSession from './LockSession';
import useSession from '../../useSession';
import useSessionUserPermissions from '../useSessionUserPermissions';
import useIsDisabled from '../../../../hooks/useIsDisabled';

interface BoardHeaderProps {
  onRenameSession: (name: string) => void;
  onEditOptions: (options: SessionOptions) => void;
  onEditColumns: (columns: ColumnDefinition[]) => void;
  onSaveTemplate: (
    options: SessionOptions,
    columns: ColumnDefinition[]
  ) => void;
  onLockSession: (locked: boolean) => void;
}

const useStyles = makeStyles({
  sessionName: {
    fontWeight: 300,
  },
  container: {
    marginTop: 20,
  },
});

function BoardHeader({
  onEditOptions,
  onEditColumns,
  onSaveTemplate,
  onLockSession,
  onRenameSession,
}: BoardHeaderProps) {
  const translations = useTranslations();
  const classes = useStyles();
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

  const handleReveal = useCallback(() => {
    if (session) {
      const modifiedOptions: SessionOptions = {
        ...session.options,
        blurCards: false,
      };
      onEditOptions(modifiedOptions);
    }
  }, [onEditOptions, session]);

  const handleRenameSession = useCallback(
    (name: string) => {
      onRenameSession(encrypt(name));
    },
    [onRenameSession, encrypt]
  );

  if (!session) {
    return <span>Loading...</span>;
  }

  return (
    <>
      {!canDecrypt ? <EncryptionModal /> : null}
      {!isLoggedIn ? (
        <Alert severity="warning">{translations.PostBoard.notLoggedIn}</Alert>
      ) : null}
      {!canDecrypt ? (
        <Alert severity="error">
          {translations.Encryption.sessionEncryptionError}
        </Alert>
      ) : null}
      {permissions.hasReachedMaxPosts ? (
        <Alert severity="warning">
          {translations.PostBoard.maxPostsReached}
        </Alert>
      ) : null}
      {isDisabled ? (
        <Alert severity="warning">
          <AlertTitle>
            {translations.TrialPrompt.allowanceReachedTitle}
          </AlertTitle>
          {translations.TrialPrompt.allowanceReachedDescription}
        </Alert>
      ) : null}

      <Header className={classes.container}>
        <LeftOptions>
          {canReveal ? <RevealButton onClick={handleReveal} /> : null}
          {canModifyOptions ? (
            <ModifyOptions
              onEditOptions={onEditOptions}
              onEditColumns={onEditColumns}
              onSaveTemplate={onSaveTemplate}
            />
          ) : null}
        </LeftOptions>
        <Title>
          <Typography
            variant="h5"
            align="center"
            className={classes.sessionName}
          >
            <EditableLabel
              placeholder={translations.SessionName.defaultSessionName}
              value={decrypt(session.name)}
              centered
              onChange={handleRenameSession}
              readOnly={!isLoggedIn || !canDecrypt}
            />
          </Typography>
        </Title>
        <RightOptions>
          {canModifyOptions ? <LockSession onLock={onLockSession} /> : null}
        </RightOptions>
        <VoteCounts>
          <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
        </VoteCounts>
      </Header>
      {shouldDisplayEncryptionWarning ? (
        <TransitionAlert
          severity="warning"
          title={translations.Encryption.newEncryptedSessionWarningTitle}
        >
          {translations.Encryption.newEncryptedSessionWarningContent!(
            key || '(unknown)'
          )}
        </TransitionAlert>
      ) : null}
    </>
  );
}

const Header = styled.div`
  display: grid;
  justify-items: center;
  align-items: center;
  grid-template-columns: 1fr 3fr 1fr;
  grid-template-rows: auto auto;
  grid-template-areas:
    'left title right'
    '. votes .';
  column-gap: 10px;
  row-gap: 15px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: auto auto auto;
    grid-template-areas:
      'left right'
      'title title'
      'votes votes';
  }

  @media (max-width: 500px) {
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto auto;
    row-gap: 20px;
    grid-template-areas:
      'title'
      'left'
      'right'
      'votes';
  }
`;

const Title = styled.div`
  grid-area: title;
  display: flex;
  align-items: center;
  justify-self: stretch;
  > * {
    width: 100%;
  }
`;

const VoteCounts = styled.div`
  grid-area: votes;
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const LeftOptions = styled.div`
  grid-area: left;
  display: flex;
  justify-self: start;

  > * {
    margin-right: 10px !important;
  }

  @media (max-width: 500px) {
    justify-self: center;
  }
`;

const RightOptions = styled.div`
  grid-area: right;
  display: flex;
  justify-self: end;

  @media (max-width: 500px) {
    justify-self: center;
    margin-top: 10px;
  }
`;

export default BoardHeader;
