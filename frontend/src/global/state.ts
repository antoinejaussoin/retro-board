import { fetchBackendCapabilities } from 'api';
import type { BackendCapabilities } from 'common';
import { selector } from 'recoil';

const defaultBackendCapabilities: BackendCapabilities = {
  adminEmail: '',
  licenced: true,
  selfHosted: false,
  disableAnonymous: false,
  disablePasswords: false,
  disablePasswordRegistration: false,
  disableAccountDeletion: false,
  disableShowAuthor: false,
  oAuth: {
    google: false,
    github: false,
    twitter: false,
    microsoft: false,
    slack: false,
    okta: false,
  },
  emailAvailable: false,
  ai: false,
};

export const backendCapabilitiesState = selector<BackendCapabilities>({
  key: 'BACKEND_CAPABILITIES',
  get: async () => {
    const data = await fetchBackendCapabilities();

    if (data) {
      return data;
    }

    return defaultBackendCapabilities;
  },
});
