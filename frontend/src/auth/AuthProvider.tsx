import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import Context from './Context';
import { FullUser } from 'common';
import { me } from '../api';
import { setScope } from '../track';

export default function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [initialised, setInitialised] = useState(false);

  const handleUser = useCallback((user: FullUser | null) => {
    setScope((scope) => {
      if (scope && user) {
        scope.setUser({
          id: user.id,
          email: user.email || undefined,
          username: user.username || undefined,
        });
      }
    });
    setUser(user);
  }, []);

  useEffect(() => {
    async function getUser() {
      setUser(await me());
      setInitialised(true);
    }
    getUser();
  }, []);

  return (
    <Context.Provider value={{ setUser: handleUser, user, initialised }}>
      {children}
    </Context.Provider>
  );
}
