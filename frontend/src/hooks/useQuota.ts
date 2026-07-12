import type { Quota } from 'common';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { getQuota } from '../views/account/api';
import useUser from '../state/user/useUser';
import { getItem, setItem } from '../utils/localStorage';
import { queryKeys } from '../state/queryKeys';

export const LOCAL_STORAGE_POSTS_KEY = 'posts';
export const DEFAULT_QUOTA = 50;

async function loadQuota(accountType: string): Promise<Quota> {
  if (accountType === 'anonymous') {
    const storedPosts = Number.parseInt(
      getItem(LOCAL_STORAGE_POSTS_KEY) || '0',
    );
    return {
      posts: storedPosts,
      quota: DEFAULT_QUOTA,
    };
  }
  const backendQuota = await getQuota();
  return (
    backendQuota ?? {
      posts: 0,
      quota: DEFAULT_QUOTA,
    }
  );
}

type QuotaResult = {
  quota: Quota | null;
  increment: () => void;
};

export default function useQuota(): QuotaResult {
  const user = useUser();
  const queryClient = useQueryClient();
  const { data: quota = null } = useQuery({
    queryKey: [...queryKeys.quota, user?.id ?? 'anonymous'],
    queryFn: () => {
      if (!user) {
        return Promise.resolve({
          posts: 0,
          quota: DEFAULT_QUOTA,
        });
      }
      return loadQuota(user.accountType);
    },
    enabled: !!user,
  });

  const increment = useCallback(() => {
    if (!user) {
      return;
    }
    const key = [...queryKeys.quota, user.id];
    queryClient.setQueryData<Quota | null>(key, (old) => {
      const newQuota = old
        ? {
            ...old,
            posts: old.posts + 1,
          }
        : {
            quota: DEFAULT_QUOTA,
            posts: 1,
          };
      if (user.accountType === 'anonymous') {
        setItem(LOCAL_STORAGE_POSTS_KEY, newQuota.posts.toString());
      }
      return newQuota;
    });
  }, [queryClient, user]);

  const result = useMemo(() => ({ quota, increment }), [quota, increment]);

  return result;
}
