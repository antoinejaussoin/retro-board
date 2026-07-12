import { fetchBackendCapabilities } from 'api';
import type { BackendCapabilities } from 'common';

export const defaultBackendCapabilities: BackendCapabilities = {
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

export async function loadBackendCapabilities(): Promise<BackendCapabilities> {
  const data = await fetchBackendCapabilities();
  return data ?? defaultBackendCapabilities;
}
