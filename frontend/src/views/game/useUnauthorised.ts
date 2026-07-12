import type {
  AccessErrorType,
  Session,
  UnauthorizedAccessPayload,
} from 'common';
import { useCallback } from 'react';
import { useGameStore } from './state';

interface UseUnauthorised {
  unauthorised: UnauthorizedAccessPayload | null;
  setUnauthorised: (reason?: AccessErrorType, session?: Session) => void;
  resetUnauthorised: () => void;
}

export default function useUnauthorised(): UseUnauthorised {
  const unauthorised = useGameStore((s) => s.unauthorised);
  const setUnauthorisedValue = useGameStore((s) => s.setUnauthorised);

  const setUnauthorised = useCallback(
    (reason?: AccessErrorType, session?: Session) => {
      setUnauthorisedValue({ type: reason, session });
    },
    [setUnauthorisedValue],
  );

  const resetUnauthorised = useCallback(() => {
    setUnauthorisedValue(null);
  }, [setUnauthorisedValue]);

  return {
    unauthorised,
    setUnauthorised,
    resetUnauthorised,
  };
}
