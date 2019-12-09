import { useEffect } from 'react';
import useGlobalState from '../state';
import { getItem } from '../utils/localStorage';

export default () => {
  const { login } = useGlobalState();
  useEffect(() => {
    const username = getItem('user_name');
    const id = getItem('user_id');
    if (username && id) {
      login(username, id);
    }
  }, [login]);
};
