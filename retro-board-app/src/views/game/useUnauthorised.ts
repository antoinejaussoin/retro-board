import { AccessErrorType } from '@retrospected/common';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { UnauthorisedReasonState, UnauthorisedState } from './state';

interface UseUnauthorised {
  unauthorised: boolean;
  unauthorisedReason?: AccessErrorType;
  setUnauthorised: (reason?: AccessErrorType) => void;
}

export default function useUnauthorised(): UseUnauthorised {
  const [unauthorised, setUnauthorisedValue] = useRecoilState(
    UnauthorisedState
  );
  const [unauthorisedReason, setReason] = useRecoilState(
    UnauthorisedReasonState
  );

  const setUnauthorised = useCallback(
    (reason?: AccessErrorType) => {
      setUnauthorisedValue(true);
      setReason(reason);
    },
    [setUnauthorisedValue, setReason]
  );

  return { unauthorised, unauthorisedReason, setUnauthorised };
}
