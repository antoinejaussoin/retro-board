import { some, values } from 'lodash';
import { useRecoilValue } from 'recoil';
import { oauthAvailabilitiesState } from './state';

export default function useOAuthAvailabilities() {
  const details = useRecoilValue(oauthAvailabilitiesState);
  return {
    any: some(values(details)),
    details,
  };
}
