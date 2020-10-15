import React, { useState } from 'react';
import { User } from 'retro-board-common';
import Login from './account/Login';
import Register from './account/Register';

interface AccountAuthProps {
  onClose: () => void;
  onUser: (user: User | null) => void;
}

const AccountAuth = ({ onClose, onUser }: AccountAuthProps) => {
  const [loginMode, setLoginMode] = useState(true);
  return loginMode ? (
    <Login
      onUser={onUser}
      onClose={onClose}
      onAskRegistration={() => setLoginMode(false)}
    />
  ) : (
    <Register onUser={onUser} onClose={onClose} />
  );
};
export default AccountAuth;
