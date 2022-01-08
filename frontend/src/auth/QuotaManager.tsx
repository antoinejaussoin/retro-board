import { Quota } from 'common';
import React, { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import { getQuota } from '../views/account/api';
import useUser from './useUser';
import { getItem } from '../utils/localStorage';

export const LOCAL_STORAGE_POSTS_KEY = 'posts';
export const DEFAULT_QUOTA = 50;
export const quotaState = atom<Quota | null>({ key: 'quota', default: null });

export default function QuotaManager({
  children,
}: React.PropsWithChildren<{}>) {
  const user = useUser();
  const [quota, setQuota] = useRecoilState(quotaState);

  useEffect(() => {
    if (!user) {
      setQuota(null);
    }
  }, [user, setQuota]);

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
  }, [user, setQuota, quota]);
  return <>{children}</>;
}
