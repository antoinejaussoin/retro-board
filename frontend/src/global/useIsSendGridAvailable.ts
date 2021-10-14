import { useRecoilValue } from 'recoil';
import { isSendGridAvailableState } from './state';

export default function useIsSendGridAvailable() {
  return useRecoilValue(isSendGridAvailableState);
}
