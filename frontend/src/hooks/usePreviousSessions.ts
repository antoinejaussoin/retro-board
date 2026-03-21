import type { SessionMetadata } from 'common';
import { useCallback } from 'react';
import { fetchPreviousSessions } from '../api';
import useUser from '../state/user/useUser';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function usePreviousSessions(): [SessionMetadata[], () => void] {
  const user = useUser();
  const queryClient = useQueryClient();

  const { data: sessions = [] } = useQuery({
    queryKey: ['previous-sessions'],
    queryFn: fetchPreviousSessions,
    enabled: !!user,
  });

  const refresh = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['previous-sessions'] });
  }, [queryClient]);

  return [user ? sessions : [], refresh];
}
