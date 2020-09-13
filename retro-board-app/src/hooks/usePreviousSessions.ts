import { SessionMetadata } from 'retro-board-common';
import useUser from '../auth/useUser';
import { fetchPreviousSessions } from '../api';
import { useState, useEffect } from 'react';

let CACHE: SessionMetadata[] = [];

export default (): SessionMetadata[] => {
  const [sessions, setSessions] = useState<SessionMetadata[]>(CACHE);
  const user = useUser();

  useEffect(() => {
    async function load() {
      if (user && user.accountType !== 'anonymous') {
        const previousSessions = await fetchPreviousSessions();
        setSessions(previousSessions);
        CACHE = previousSessions;
      } else {
        setSessions([]);
        CACHE = [];
      }
    }
    load();
  }, [user]);

  return sessions;
};
