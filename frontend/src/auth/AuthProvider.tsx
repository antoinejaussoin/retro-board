import { useState, useEffect, useCallback, PropsWithChildren } from 'react';
import Context from './Context';
import { FullUser } from 'common';
import { me } from '../api';
import { useLocation } from 'react-router-dom';
import { setScope } from '../track';

export default function AuthProvider({ children }: PropsWithChildren<{}>) {
  const [user, setUser] = useState<FullUser | null>(null);
  const [initialised, setInitialised] = useState(false);
  const location = useLocation();

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

  useEffect(() => {
    if (!user && location.pathname === '/') {
      showMarketing();
    } else {
      hideMarketing();
    }
  }, [initialised, user, location.pathname]);

  return (
    <Context.Provider value={{ setUser: handleUser, user, initialised }}>
      {children}
    </Context.Provider>
  );
}

function showMarketing() {
  Array.prototype.forEach.call(
    document.querySelectorAll('.marketing'),
    function (element) {
      try {
        element.disabled = false;
      } catch (err) {}
    }
  );
  Array.prototype.forEach.call(
    document.querySelectorAll('.marketing-content'),
    function (element) {
      try {
        element.style.display = 'block';
      } catch (err) {}
    }
  );
}

function hideMarketing() {
  Array.prototype.forEach.call(
    document.querySelectorAll('.marketing-content'),
    function (element) {
      try {
        element.style.display = 'none';
      } catch (err) {}
    }
  );
  Array.prototype.forEach.call(
    document.querySelectorAll('.marketing'),
    function (element) {
      try {
        element.disabled = true;
      } catch (err) {}
    }
  );
}
