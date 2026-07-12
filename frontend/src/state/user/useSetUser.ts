import { useSetRecoilState } from 'recoil';
import { userState } from './user-state';

export function useSetUser() {
  const setUser = useSetRecoilState(userState);
  return setUser;
}
