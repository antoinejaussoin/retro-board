import { useRecoilValue } from 'recoil';
import { selfHostedState } from './state';

export default function useIsSelfHosted() {
  return useRecoilValue(selfHostedState);
}
