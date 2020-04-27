import React, { useState, useEffect } from 'react';
import Context from './Context';
import { User } from 'retro-board-common';
import { me } from '../api';
import { useLocation } from 'react-router-dom';

const AuthProvider: React.FC = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [initialised, setInitialised] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function getUser() {
      setUser(await me());
      setInitialised(true);
    }
    getUser();
  }, []);

  useEffect(() => {
    if (!user && location.pathname === '/') {
      console.log('We are not logged in and on home page');
      showMarketing();
    } else {
      console.log('We are logged in or not on home page');
      hideMarketing();
    }
  }, [initialised, user, location.pathname]);

  return (
    <Context.Provider value={{ setUser, user, initialised }}>
      {children}
    </Context.Provider>
  );
};

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

export default AuthProvider;
