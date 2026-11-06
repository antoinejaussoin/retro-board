import { Check, RefreshCw } from 'lucide-react';
import throttle from 'lodash/throttle';
import { useCallback, useEffect, useState } from 'react';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { recordManualError, trackEvent } from '../../track';
import { AckItem } from './types';

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
        acks.filter((a) => a.requested.valueOf() + 5000 < new Date().valueOf()),
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
      <div className="m-1 flex justify-end">
        <Check className="size-4 text-emerald-200" />
      </div>
    );
  }

  if (!lateAcks.length) {
    return (
      <div className="m-1 flex justify-end">
        <RefreshCw className="size-4 animate-spin text-amber-400 [animation-duration:4s]" />
      </div>
    );
  }

  return (
    <Alert
      severity="error"
      title="Something's not quite right 😓"
      className="m-2"
    >
      <p>
        {lateAcks.length} message{lateAcks.length === 1 ? ' was' : 's were'} not
        received by the server in a timely manner. Please reload the session.
      </p>
      <Button size="sm" className="mt-2" onClick={handleRefresh}>
        Reload
      </Button>
    </Alert>
  );
}
