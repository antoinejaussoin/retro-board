import { SessionMetadata } from 'common';
import useUser from '../auth/useUser';
import { fetchPreviousSessions } from '../api';
import { useState, useEffect, useCallback } from 'react';

let CACHE: SessionMetadata[] = [];

export default function usePreviousSessions(): [SessionMetadata[], Function] {
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
