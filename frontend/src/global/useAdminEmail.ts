import { useRecoilValue } from 'recoil';
import { adminEmailState } from './state';

export default function useAdminEmail() {
  return useRecoilValue(adminEmailState);
}
