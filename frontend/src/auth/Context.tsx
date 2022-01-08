import { createContext } from 'react';
import { FullUser } from 'common';

interface UserContextProps {
  user: FullUser | null;
  initialised: boolean;
  setUser: (user: FullUser | null) => void;
}

const UserContext = createContext<UserContextProps>({
  user: null,
  initialised: false,
  setUser: (_: FullUser | null) => {},
});

export default UserContext;
