import type { FullUser } from 'common';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { queryKeys } from '../queryKeys';

export function useSetUser() {
  const queryClient = useQueryClient();
  return useCallback(
    (user: FullUser | null) => {
      queryClient.setQueryData(queryKeys.user, user);
    },
    [queryClient],
  );
}
