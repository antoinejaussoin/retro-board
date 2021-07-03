import { atom } from 'recoil';
import { OAuthAvailabilities } from '@retrospected/common';

export const adminEmailState = atom<string | null>({
  key: 'ADMIN_EMAIL',
  default: null,
});
export const isLicencedState = atom<boolean>({
  key: 'LICENCED',
  default: true,
});
export const selfHostedState = atom<boolean>({
  key: 'SELF-HOSTED',
  default: false,
});
export const oauthAvailabilitiesState = atom<OAuthAvailabilities>({
  key: 'OAuthAvailabilities',
  default: {
    google: false,
    github: false,
    twitter: false,
    microsoft: false,
    slack: false,
    okta: false,
  },
});
