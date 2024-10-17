import type { SessionMetadata } from 'common';
import { useCallback, useEffect, useState } from 'react';
import { fetchPreviousSessions } from '../api';
import useUser from '../state/user/useUser';

let CACHE: SessionMetadata[] = [];

export default function usePreviousSessions(): [SessionMetadata[], () => void] {
  const [sessions, setSessions] = useState<SessionMetadata[]>(CACHE);
  const user = useUser();

  const refresh = useCallback(async () => {
    if (user) {
      const previousSessions = await fetchPreviousSessions();
      setSessions(previousSessions);
      CACHE = previousSessions;
    } else {
      setSessions([]);
      CACHE = [];
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return [sessions, refresh];
}
