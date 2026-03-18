import { useQuery } from '@tanstack/react-query';
import { useHasRunOut } from './TimerProvider';
import useSession from './useSession';

const TIMER_QUERY_KEY = ['game-timer'] as const;

export { TIMER_QUERY_KEY };

export function useTimer() {
  const { data: timer = null } = useQuery<Date | null>({
    queryKey: TIMER_QUERY_KEY,
    queryFn: () => null,
    gcTime: Infinity,
    staleTime: Infinity,
  });
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
