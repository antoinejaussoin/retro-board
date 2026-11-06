import type { Participant, Session, UnauthorizedAccessPayload } from 'common';
import { create } from 'zustand';
import { reduceSession, type SessionEvent } from './reduceSession';

type GameStore = {
  participants: Participant[];
  unauthorised: UnauthorizedAccessPayload | null;
  session: Session | null;
  timer: Date | null;
  setParticipants: (participants: Participant[]) => void;
  setUnauthorised: (value: UnauthorizedAccessPayload | null) => void;
  dispatch: (event: SessionEvent) => void;
  setTimer: (timer: Date | null) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  participants: [],
  unauthorised: null,
  session: null,
  timer: null,
  setParticipants: (participants) => set({ participants }),
  setUnauthorised: (unauthorised) => set({ unauthorised }),
  dispatch: (event) => set({ session: reduceSession(get().session, event) }),
  setTimer: (timer) => set({ timer }),
}));
