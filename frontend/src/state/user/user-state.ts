import { me } from 'api';
import type { FullUser } from 'common';
import { atom, selector } from 'recoil';

const userDefaults = selector({
  key: 'user-defaults',
  get: async () => {
    const user = await me();
    return user;
  },
});

export const userState = atom<FullUser | null>({
  key: 'user',
  default: userDefaults,
});
