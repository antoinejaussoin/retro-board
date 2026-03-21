import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import type {
  AccessErrorType,
  Session,
  UnauthorizedAccessPayload,
} from 'common';

interface UnauthorisedContextValue {
  unauthorised: UnauthorizedAccessPayload | null;
  setUnauthorised: (reason?: AccessErrorType, session?: Session) => void;
  resetUnauthorised: () => void;
}

const UnauthorisedContext = createContext<UnauthorisedContextValue>({
  unauthorised: null,
  setUnauthorised: () => {},
  resetUnauthorised: () => {},
});

export function UnauthorisedProvider({ children }: PropsWithChildren) {
  const [unauthorised, setUnauthorisedValue] =
    useState<UnauthorizedAccessPayload | null>(null);

  const setUnauthorised = useCallback(
    (reason?: AccessErrorType, session?: Session) => {
      setUnauthorisedValue({ type: reason, session });
    },
    [],
  );

  const resetUnauthorised = useCallback(() => {
    setUnauthorisedValue(null);
  }, []);

  return (
    <UnauthorisedContext.Provider
      value={{ unauthorised, setUnauthorised, resetUnauthorised }}
    >
      {children}
    </UnauthorisedContext.Provider>
  );
}

export default function useUnauthorised() {
  return useContext(UnauthorisedContext);
}
