import { useEffect } from 'react';
import useGlobalState from '../state';

export default () => {
  const { login } = useGlobalState();
  useEffect(() => {
    const username = localStorage.getItem('user_name');
    const id = localStorage.getItem('user_id');
    if (username && id) {
      login(username, id);
    }
  }, [login]);
};
