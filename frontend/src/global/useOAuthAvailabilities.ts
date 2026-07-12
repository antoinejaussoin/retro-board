import { some, values } from 'lodash';
import useBackendCapabilities from './useBackendCapabilities';

export default function useOAuthAvailabilities() {
  const backend = useBackendCapabilities();
  const details = backend.oAuth;
  return {
    any: some(values(details)),
    details,
  };
}
