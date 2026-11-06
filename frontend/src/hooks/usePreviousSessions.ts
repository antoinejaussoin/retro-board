import type { SessionMetadata } from 'common';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { fetchPreviousSessions } from '../api';
import { queryKeys } from '../state/queryKeys';
import useUser from '../state/user/useUser';

export default function usePreviousSessions(): [
  SessionMetadata[],
  () => Promise<void>,
] {
  const user = useUser();
  const queryClient = useQueryClient();
  const { data: sessions = [] } = useQuery({
    queryKey: queryKeys.previousSessions,
    queryFn: fetchPreviousSessions,
    enabled: !!user,
  });

  const refresh = useCallback(async () => {
    if (!user) {
      queryClient.setQueryData(queryKeys.previousSessions, []);
      return;
    }
    await queryClient.invalidateQueries({
      queryKey: queryKeys.previousSessions,
    });
  }, [queryClient, user]);

  return [user ? sessions : [], refresh];
}
