import useIsPro from '../auth/useIsPro';
import useQuota from './useQuota';

/**
 * Whether to disable part of the UI because the user has reached his quota
 */
export default function useIsDisabled() {
  const isPro = useIsPro();
  const { quota } = useQuota();
  const overQuota = !!quota && quota.posts >= quota.quota;
  const isDisabled = !isPro && overQuota;
  return isDisabled;
}
