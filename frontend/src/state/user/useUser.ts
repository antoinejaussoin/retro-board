import type { FullUser } from 'common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { fetchCurrentUser } from './user-state';
import { queryKeys } from '../queryKeys';

function useUser(): FullUser | null {
  const { data: user } = useSuspenseQuery({
    queryKey: queryKeys.user,
    queryFn: fetchCurrentUser,
  });
  return user;
}

interface UseUserMetadataReturn {
  user: FullUser | null;
  initialised: boolean;
}

export function useUserMetadata(): UseUserMetadataReturn {
  const user = useUser();

  return { user, initialised: true };
}

export default useUser;
