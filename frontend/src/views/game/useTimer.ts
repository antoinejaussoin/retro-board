import { useHasRunOut } from './TimerProvider';
import { useGameStore } from './state';
import useSession from './useSession';

export function useTimer() {
  return useGameStore((s) => s.timer);
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
