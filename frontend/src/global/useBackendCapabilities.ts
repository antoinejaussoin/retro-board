import type { BackendCapabilities } from 'common';
import { fetchBackendCapabilities } from 'api';
import { useSuspenseQuery } from '@tanstack/react-query';

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

export default function useBackendCapabilities(): BackendCapabilities {
  const { data } = useSuspenseQuery({
    queryKey: ['backend-capabilities'],
    queryFn: async () => {
      const data = await fetchBackendCapabilities();
      return data || defaultBackendCapabilities;
    },
  });
  return data;
}
