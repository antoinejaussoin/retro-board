import { useContext } from 'react';
import UserContext from './Context';
import { FullUser } from 'common';

function useUser(): FullUser | null {
  const { user } = useContext(UserContext);

  return user;
}

interface UseUserMetadataReturn {
  user: FullUser | null;
  initialised: boolean;
}

export function useUserMetadata(): UseUserMetadataReturn {
  const { user, initialised } = useContext(UserContext);

  return { user, initialised };
}

export default useUser;
