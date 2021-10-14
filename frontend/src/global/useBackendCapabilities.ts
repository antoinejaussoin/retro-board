import { BackendCapabilities } from '@retrospected/common';
import { useRecoilValue } from 'recoil';
import { backendCapabilitiesState } from './state';

export default function useBackendCapabilities(): BackendCapabilities {
  return useRecoilValue(backendCapabilitiesState);
}
