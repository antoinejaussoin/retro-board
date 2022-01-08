import { AccessErrorType, Participant, Session } from 'common';
import { atom } from 'recoil';

export const ParticipantsState = atom<Participant[]>({
  key: 'PARTICIPANTS',
  default: [],
});

export const UnauthorisedState = atom<boolean>({
  key: 'UNAUTHORISED',
  default: false,
});

export const UnauthorisedReasonState = atom<AccessErrorType | undefined>({
  key: 'ACCESS_ERROR_TYPE',
  default: undefined,
});

export const SessionState = atom<Session | null>({
  key: 'SESSION',
  default: null,
});
