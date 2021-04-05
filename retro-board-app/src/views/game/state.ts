import { Participant } from '@retrospected/common';
import { atom } from 'recoil';

export const ParticipantsState = atom<Participant[]>({
  key: 'PARTICIPANTS',
  default: [],
});
