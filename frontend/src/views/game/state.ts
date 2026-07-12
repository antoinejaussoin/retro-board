import type { Participant, Session, UnauthorizedAccessPayload } from 'common';
import { atom } from 'recoil';

export const ParticipantsState = atom<Participant[]>({
  key: 'PARTICIPANTS',
  default: [],
});

export const UnauthorisedState = atom<UnauthorizedAccessPayload | null>({
  key: 'UNAUTHORISED',
  default: null,
});

export const SessionState = atom<Session | null>({
  key: 'SESSION',
  default: null,
});

export const TimerState = atom<Date | null>({
  key: 'TIMER',
  default: null,
});
