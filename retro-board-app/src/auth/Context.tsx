import { createContext } from 'react';
import { FullUser } from '@retrospected/common';

interface UserContextProps {
  user: FullUser | null | undefined;
  initialised: boolean;
  setUser: (user: FullUser | null) => void;
}

const UserContext = createContext<UserContextProps>({
  user: undefined,
  initialised: false,
  setUser: (_: FullUser | null) => {},
});

export default UserContext;
