import type { Quota } from 'common';
import { useContext } from 'react';
import { QuotaContext } from '../auth/QuotaManager';

type QuotaResult = {
  quota: Quota | null;
  increment: () => void;
};

export default function useQuota(): QuotaResult {
  const { quota, increment } = useContext(QuotaContext);
  return { quota, increment };
}
