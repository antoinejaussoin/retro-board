import type { Quota } from 'common';
import React, { createContext, useCallback, useEffect, useState } from 'react';
import { getQuota } from '../views/account/api';
import useUser from '../state/user/useUser';
import { getItem, setItem } from '../utils/localStorage';

export const LOCAL_STORAGE_POSTS_KEY = 'posts';
export const DEFAULT_QUOTA = 50;

interface QuotaContextValue {
  quota: Quota | null;
  setQuota: React.Dispatch<React.SetStateAction<Quota | null>>;
  increment: () => void;
}

export const QuotaContext = createContext<QuotaContextValue>({
  quota: null,
  setQuota: () => {},
  increment: () => {},
});

export default function QuotaManager({
  children,
}: React.PropsWithChildren<{}>) {
  const user = useUser();
  const [quota, setQuota] = useState<Quota | null>(null);

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
  }, [user]);

  useEffect(() => {
    if (!user) {
      setQuota(null);
    }
  }, [user]);

  useEffect(() => {
    async function load() {
      if (user && !quota) {
        if (user.accountType === 'anonymous') {
          const storedPosts = Number.parseInt(
            getItem(LOCAL_STORAGE_POSTS_KEY) || '0'
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
    }

    load();
  }, [user, quota]);

  return (
    <QuotaContext.Provider value={{ quota, setQuota, increment }}>
      {children}
    </QuotaContext.Provider>
  );
}
