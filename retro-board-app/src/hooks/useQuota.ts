import { Quota } from '@retrospected/common';
import useStateFetch from './useStateFetch';

export default function useQuota(): Quota | null {
  const [quota] = useStateFetch('/api/quota', null);
  return quota;
}
