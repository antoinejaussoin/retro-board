import type { FullUser } from 'common';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

export function useSetUser() {
  const queryClient = useQueryClient();
  return useCallback(
    (userOrUpdater: FullUser | null | ((prev: FullUser | null) => FullUser | null)) => {
      queryClient.setQueryData<FullUser | null>(['user'], (old) => {
        if (typeof userOrUpdater === 'function') {
          return userOrUpdater(old ?? null);
        }
        return userOrUpdater;
      });
    },
    [queryClient],
  );
}
