import React, { useCallback } from 'react';
import styled from 'styled-components';
import { SessionOptions, ColumnDefinition } from 'retro-board-common';
import { Typography, makeStyles, Box } from '@material-ui/core';
import useTranslations from '../../../../translations';
import useGlobalState from '../../../../state';
import useRemainingVotes from '../useRemainingVotes';
import useCanReveal from '../useCanReveal';
import EditableLabel from '../../../../components/EditableLabel';
import RemainingVotes from '../RemainingVotes';
import useUser from '../../../../auth/useUser';
import { Alert } from '@material-ui/lab';
import RevealButton from '../RevealButton';
import ModifyOptions from '../ModifyOptions';
import useCanModifyOptions from '../useCanModifyOptions';
import useCrypto from '../../../../crypto/useCrypto';
import useCanDecrypt from '../../../../crypto/useCanDecrypt';
import EncryptionModal from '../EncryptionModal';
import useShouldDisplayEncryptionWarning from '../useShouldDisplayEncryptionWarning';
import TransitionAlert from '../../../../components/TransitionAlert';
import { useEncryptionKey } from '../../../../crypto/useEncryptionKey';
import LockSession from '../LockSession';

interface BoardHeaderProps {
  onRenameSession: (name: string) => void;
  onEditOptions: (options: SessionOptions) => void;
  onEditColumns: (columns: ColumnDefinition[]) => void;
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
  onLockSession,
  onRenameSession,
}: BoardHeaderProps) {
  const { state } = useGlobalState();
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
  const shouldDisplayEncryptionWarning = useShouldDisplayEncryptionWarning();

  const handleReveal = useCallback(() => {
    if (state && state.session) {
      const modifiedOptions: SessionOptions = {
        ...state.session.options,
        blurCards: false,
      };
      onEditOptions(modifiedOptions);
    }
  }, [onEditOptions, state]);

  const handleRenameSession = useCallback(
    (name: string) => {
      onRenameSession(encrypt(name));
    },
    [onRenameSession, encrypt]
  );

  if (!state.session) {
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

      <Box className={classes.container}>
        <HeaderWrapper>
          <LeftOptions>
            {canReveal ? <RevealButton onClick={handleReveal} /> : null}
            {canModifyOptions ? (
              <ModifyOptions
                onEditOptions={onEditOptions}
                onEditColumns={onEditColumns}
              />
            ) : null}
          </LeftOptions>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            paragraph
            className={classes.sessionName}
          >
            <EditableLabel
              placeholder={translations.SessionName.defaultSessionName}
              value={decrypt(state.session.name)}
              centered
              onChange={handleRenameSession}
              readOnly={!isLoggedIn || !canDecrypt}
            />
          </Typography>
          <RightOptions>
            {canModifyOptions ? <LockSession onLock={onLockSession} /> : null}
          </RightOptions>
        </HeaderWrapper>
        <SubHeader>
          <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
        </SubHeader>
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
      </Box>
    </>
  );
}

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  > *:first-child {
    flex: 1;
  }

  > *:nth-child(2) {
    flex: 3;
    margin: 0 20px;
  }

  > *:last-child {
    flex: 1;
  }

  @media (max-width: 500px) {
    margin-top: 40px;
    flex-direction: column;
    margin-bottom: 0px;

    > *:last-child {
      margin: 20px 0;
    }
  }
`;

const SubHeader = styled.div`
  display: flex;
  justify-content: center;
`;

const LeftOptions = styled.div`
  display: flex;
  justify-content: flex-start;

  > * {
    margin-right: 10px;
  }

  @media (max-width: 500px) {
    margin-bottom: 20px;
    margin-top: -15px;
    order: 6;
  }
`;

const RightOptions = styled.div`
  display: flex;
  justify-content: flex-end;

  > * {
    margin-right: 10px;
  }

  @media (max-width: 500px) {
    margin-bottom: 20px;
    margin-top: -15px;
    order: 6;
  }
`;

export default BoardHeader;
