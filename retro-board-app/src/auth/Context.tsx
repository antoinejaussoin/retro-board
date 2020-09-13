import React from 'react';
import { User } from 'retro-board-common';

interface UserContextProps {
  user: User | null;
  initialised: boolean;
  setUser: (user: User | null) => void;
}

const UserContext = React.createContext<UserContextProps>({
  user: null,
  initialised: false,
  setUser: (_: User | null) => {},
});

export default UserContext;
