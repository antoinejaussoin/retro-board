import {
  Button,
  colors,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
} from '@material-ui/core';
import { Lock, VerifiedUser } from '@material-ui/icons';
import React, { useCallback, useState } from 'react';
import styled from 'styled-components';
import CustomAvatar from '../../../../components/Avatar';
import useGlobalState from '../../../../state';
import { useSnackbar } from 'notistack';
import useTranslations from '../../../../translations';
import ProButton from '../../../../components/ProButton';

interface LockSessionProps {
  onLock(locked: boolean): void;
}

function LockSession({ onLock }: LockSessionProps) {
  const { state } = useGlobalState();
  const [open, setOpen] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const { Private: translations } = useTranslations();
  const fullScreen = useMediaQuery('(max-width:600px)');

  const session = state.session;
  const players = state.players;

  const handleLock = useCallback(() => {
    if (session) {
      onLock(!session.locked);
      enqueueSnackbar(
        session.locked
          ? translations.unlockSuccessNotification
          : translations.lockSuccessNotification,
        { variant: 'success' }
      );
    }
    setOpen(false);
  }, [session, onLock, enqueueSnackbar, translations]);

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

  return (
    <>
      <ProButton>
        <Button
          variant="outlined"
          color="primary"
          startIcon={
            session.locked ? (
              <VerifiedUser style={{ color: colors.red[800] }} />
            ) : (
              <VerifiedUser style={{ color: colors.green[800] }} />
            )
          }
          onClick={handleOpenDialog}
        >
          {session.locked ? translations.unlockButton : translations.lockButton}
        </Button>
      </ProButton>
      <Dialog
        onClose={handleCloseDialog}
        fullScreen={fullScreen}
        aria-labelledby="lock-session-dialog"
        open={open}
      >
        <DialogTitle id="lock-session-dialog">
          <Lock style={{ position: 'relative', top: 3 }} />
          &nbsp;{translations.lockButton}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{translations.lockDescription}</DialogContentText>
        </DialogContent>
        <DialogContent>
          <Users>
            {players.map((player) => (
              <UserContainer key={player.id}>
                <AvatarContainer>
                  <CustomAvatar user={player} />
                </AvatarContainer>
                <Name>{player.name}</Name>
              </UserContainer>
            ))}
          </Users>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>
            {translations.cancelButton}
          </Button>
          <Button variant="contained" color="primary" onClick={handleLock}>
            {translations.lockButton}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

const Users = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const UserContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 150px;
  padding: 10px;
  flex: 1;
`;

const AvatarContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const Name = styled.div`
  display: flex;
  justify-content: center;
  color: ${colors.grey[700]};
  margin-top: 10px;
`;

export default LockSession;
