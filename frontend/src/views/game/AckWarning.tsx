import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import { useEffect, useState } from 'react';
import throttle from 'lodash/throttle';
import { AckItem } from './types';
import { recordManualError, trackEvent } from '../../track';
import { useCallback } from 'react';
import styled from '@emotion/styled';
import { Autorenew, Check } from '@mui/icons-material';
import { colors } from '@mui/material';

interface AckWarningProps {
  acks: AckItem[];
  onRefresh: () => void;
}

const throttledError = throttle(recordManualError, 10000, { leading: true });

export default function AckWarning({ acks, onRefresh }: AckWarningProps) {
  const [lateAcks, setLateAcks] = useState<AckItem[]>([]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLateAcks(
        acks.filter((a) => a.requested.valueOf() + 5000 < new Date().valueOf())
      );
    }, 500);
    return () => clearInterval(timer);
  }, [acks]);

  useEffect(() => {
    if (lateAcks.length) {
      trackEvent('ack/error');
      throttledError('ack_not_received');
    }
  }, [lateAcks]);

  const handleRefresh = useCallback(() => {
    trackEvent('ack/refresh');
    onRefresh();
  }, [onRefresh]);

  if (!acks.length) {
    return (
      <Container>
        <Check htmlColor={colors.green[100]} />
      </Container>
    );
  }

  if (!lateAcks.length) {
    return (
      <Container>
        <LoopIcon htmlColor={colors.orange[300]} />
      </Container>
    );
  }

  return (
    <Alert
      severity="error"
      action={
        <Button color="primary" onClick={handleRefresh}>
          Reload
        </Button>
      }
    >
      <AlertTitle>Something's not quite right 😓</AlertTitle>
      {lateAcks.length} message{lateAcks.length === 1 ? ' was' : 's were'} not
      received by the server in a timely manner. Please reload the session.
    </Alert>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  margin: 5px;
  > svg {
    font-size: 0.9em;
  }
`;

const LoopIcon = styled(Autorenew)`
  @keyframes spin {
    100% {
      transform: rotate(360deg);
    }
  }
  animation: spin 4s linear infinite;
`;
