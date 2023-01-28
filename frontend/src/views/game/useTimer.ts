import { useRecoilValue } from 'recoil';
import { TimerState } from './state';
import { useHasRunOut } from './TimerProvider';
import useSession from './useSession';

export function useTimer() {
  const timer = useRecoilValue(TimerState);
  return timer;
}

export function useShouldLockSession() {
  const { session } = useSession();
  const ranOut = useHasRunOut();

  if (
    !session ||
    !session.options.allowTimer ||
    !session.options.readonlyOnTimerEnd
  ) {
    return false;
  }

  return ranOut;
}
