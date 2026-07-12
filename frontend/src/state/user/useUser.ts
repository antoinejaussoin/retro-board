import type { FullUser } from 'common';
import { useRecoilValue } from 'recoil';
import { userState } from './user-state';

function useUser(): FullUser | null {
  const user = useRecoilValue(userState);
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
