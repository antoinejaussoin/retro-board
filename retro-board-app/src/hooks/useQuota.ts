import { Quota } from '@retrospected/common';
import { useCallback, useEffect, useMemo } from 'react';
import { atom, useRecoilState } from 'recoil';
import useUser from '../auth/useUser';
import { getQuota } from '../views/account/api';

const LOCAL_STORAGE_POSTS_KEY = 'posts';
const DEFAULT_QUOTA = 50;
const quotaState = atom<Quota | null>({ key: 'quota', default: null });
let LOCK = false;

type QuotaResult = {
  quota: Quota | null;
  increment: () => void;
};

export default function useQuota(): QuotaResult {
  const user = useUser();
  const [quota, setQuota] = useRecoilState(quotaState);

  useEffect(() => {
    async function load() {
      if (user && !quota) {
        if (user.accountType === 'anonymous') {
          const storedPosts = Number.parseInt(
            localStorage.getItem(LOCAL_STORAGE_POSTS_KEY) || '0'
          );
          setQuota({
            posts: storedPosts,
            quota: DEFAULT_QUOTA,
          });
        } else {
          setQuota({
            posts: 0,
            quota: DEFAULT_QUOTA,
          });
          const backendQuota = await getQuota();
          setQuota(backendQuota);
        }
      }
      if (!user) {
        setQuota(null);
      }
      LOCK = false;
    }

    if (!LOCK) {
      LOCK = true;
      // setQuota({ posts: 0, quota: DEFAULT_QUOTA });
      load();
    }
  }, [user, setQuota, quota]);

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
        localStorage.setItem(
          LOCAL_STORAGE_POSTS_KEY,
          newQuota.posts.toString()
        );
      }
      return newQuota;
    });
  }, [setQuota, user]);

  const result = useMemo(() => ({ quota, increment }), [quota, increment]);

  return result;
}
