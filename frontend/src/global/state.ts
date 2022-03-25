import { atom } from 'recoil';
import { BackendCapabilities } from 'common';

export const backendCapabilitiesState = atom<BackendCapabilities>({
  key: 'BACKEND_CAPABILITIES',
  default: {
    adminEmail: '',
    licenced: true,
    selfHosted: false,
    disableAnonymous: false,
    oAuth: {
      google: false,
      github: false,
      twitter: false,
      microsoft: false,
      slack: false,
      okta: false,
    },
    sendGridAvailable: false,
  },
});
