import { Button } from '@material-ui/core';
import { Alert, AlertTitle } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { AckItem } from './types';
import { recordManualError, trackEvent } from '../../track';
import { useCallback } from 'react';

interface AckWarningProps {
  acks: AckItem[];
  onRefresh: () => void;
}

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
    if (!!lateAcks.length) {
      trackEvent('ack/error');
      recordManualError('ack_not_received');
    }
  }, [lateAcks]);

  const handleRefresh = useCallback(() => {
    trackEvent('ack/refresh');
    onRefresh();
  }, [onRefresh]);

  if (!lateAcks.length) {
    return null;
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
      <AlertTitle>Something went wrong</AlertTitle>
      {lateAcks.length} message{lateAcks.length === 1 ? ' was' : 's were'} not
      received by the server it seems. Reload the session to make sure.
    </Alert>
  );
}
