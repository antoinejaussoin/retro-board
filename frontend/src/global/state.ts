import { atom } from 'recoil';

export const adminEmailState = atom<string | null>({
  key: 'ADMIN_EMAIL',
  default: null,
});
