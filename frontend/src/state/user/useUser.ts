import type { FullUser } from 'common';
import { useUserQuery } from './useUserQuery';

function useUser(): FullUser | null {
  const { data } = useUserQuery();
  return data;
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
