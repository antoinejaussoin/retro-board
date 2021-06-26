import { atom } from 'recoil';

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
