import { Button } from '@material-ui/core';
import { Lock, LockOpen } from '@material-ui/icons';
import React, { useCallback } from 'react';
import useGlobalState from '../../state';

interface LockSessionProps {
  onLock(locked: boolean): void;
}

function LockSession({ onLock }: LockSessionProps) {
  const { state } = useGlobalState();
  const session = state.session;

  const handleLock = useCallback(() => {
    if (session) {
      onLock(!session.locked);
    }
  }, [session, onLock]);

  if (!session) {
    return null;
  }

  return (
    <Button
      variant="contained"
      color="primary"
      startIcon={session.locked ? <LockOpen /> : <Lock />}
      onClick={handleLock}
    >
      {session.locked ? 'Unlock' : 'Lock'} Session
    </Button>
  );
}

export default LockSession;
