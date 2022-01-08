import { Quota } from 'common';
import { useCallback, useMemo } from 'react';
import { useRecoilState } from 'recoil';
import {
  quotaState,
  DEFAULT_QUOTA,
  LOCAL_STORAGE_POSTS_KEY,
} from '../auth/QuotaManager';
import useUser from '../auth/useUser';
import { setItem } from '../utils/localStorage';

type QuotaResult = {
  quota: Quota | null;
  increment: () => void;
};

export default function useQuota(): QuotaResult {
  const user = useUser();
  const [quota, setQuota] = useRecoilState(quotaState);

  const increment = useCallback(() => {
    setQuota((old) => {
      const newQuota = old
        ? {
            ...old,
            posts: old.posts + 1,
          }
        : {
            quota: DEFAULT_QUOTA,
            posts: 1,
          };
      if (user && user.accountType === 'anonymous') {
        setItem(LOCAL_STORAGE_POSTS_KEY, newQuota.posts.toString());
      }
      return newQuota;
    });
  }, [setQuota, user]);

  const result = useMemo(() => ({ quota, increment }), [quota, increment]);

  return result;
}
