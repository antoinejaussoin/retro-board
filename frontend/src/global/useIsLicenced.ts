import { useRecoilValue } from 'recoil';
import { isLicencedState } from './state';

export default function useIsLicenced() {
  return useRecoilValue(isLicencedState);
}
