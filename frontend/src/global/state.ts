import { selector } from 'recoil';
import { BackendCapabilities } from 'common';
import { fetchBackendCapabilities } from 'api';

export const backendCapabilitiesState = selector<BackendCapabilities>({
  key: 'BACKEND_CAPABILITIES',
  get: async () => {
    const data = await fetchBackendCapabilities();

    if (data) {
      return data;
    }

    return {
      adminEmail: '',
      licenced: true,
      selfHosted: false,
      disableAnonymous: false,
      disablePasswords: false,
      disablePasswordRegistration: false,
      oAuth: {
        google: false,
        github: false,
        twitter: false,
        microsoft: false,
        slack: false,
        okta: false,
      },
      emailAvailable: false,
    };
  },
});
