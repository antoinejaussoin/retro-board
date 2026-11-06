import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../state/queryKeys';
import useUser from '../../state/user/useUser';
import { getPortalUrl } from './api';

export default function usePortalUrl(): string | null {
  const user = useUser();
  const { data = null } = useQuery({
    queryKey: queryKeys.portalUrl,
    queryFn: getPortalUrl,
    enabled: !!user?.stripeId,
  });
  return user?.stripeId ? data : null;
}
