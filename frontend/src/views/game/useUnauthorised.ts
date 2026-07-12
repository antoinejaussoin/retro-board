import type {
  AccessErrorType,
  Session,
  UnauthorizedAccessPayload,
} from 'common';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { UnauthorisedState } from './state';

interface UseUnauthorised {
  unauthorised: UnauthorizedAccessPayload | null;
  setUnauthorised: (reason?: AccessErrorType, session?: Session) => void;
  resetUnauthorised: () => void;
}

export default function useUnauthorised(): UseUnauthorised {
  const [unauthorised, setUnauthorisedValue] =
    useRecoilState(UnauthorisedState);

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
