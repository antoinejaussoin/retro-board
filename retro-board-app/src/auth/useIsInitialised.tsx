import { useContext } from 'react';
import UserContext from './Context';

function useIsInitialised(): boolean {
  const { initialised } = useContext(UserContext);

  return initialised;
}

export default useIsInitialised;
