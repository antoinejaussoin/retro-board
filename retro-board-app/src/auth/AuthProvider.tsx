import React, { useState, useEffect } from 'react';
import Context from './Context';
import { User } from 'retro-board-common';
import { me } from '../api';
import wait from '../utils/wait';

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialised, setInitialised] = useState(false);

  useEffect(() => {
    async function getUser() {
      await wait(3000); // TODO: remove this!!
      setUser(await me());
      setInitialised(true);
    }
    getUser();
  }, []);

  useEffect(() => {
    if (user) {
      console.log('We are logged in');
      // Array.prototype.forEach.call(
      //   document.querySelectorAll('link[rel=stylesheet].marketing'),
      //   function (element) {
      //     try {
      //       element.parentNode.removeChild(element);
      //     } catch (err) {}
      //   }
      // );
      // Array.prototype.forEach.call(
      //   document.querySelectorAll('script.marketing'),
      //   function (element) {
      //     try {
      //       element.parentNode.removeChild(element);
      //     } catch (err) {}
      //   }
      // );
      Array.prototype.forEach.call(
        document.querySelectorAll('.marketing'),
        function (element) {
          try {
            element.parentNode.removeChild(element);
          } catch (err) {}
        }
      );
    }
  }, [initialised, user]);

  return (
    <Context.Provider value={{ setUser, user, initialised }}>
      {children}
    </Context.Provider>
  );
};

export default AuthProvider;
