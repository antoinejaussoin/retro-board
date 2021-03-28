import { useContext } from 'react';
import UserContext from './Context';
import { FullUser } from '@retrospected/common';

function useUser(): FullUser | null | undefined {
  const { user } = useContext(UserContext);

  return user;
}

export default useUser;
