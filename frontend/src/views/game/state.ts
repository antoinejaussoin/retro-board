import type { Participant, Session, UnauthorizedAccessPayload } from 'common';
import { create } from 'zustand';

type GameStore = {
  participants: Participant[];
  unauthorised: UnauthorizedAccessPayload | null;
  session: Session | null;
  timer: Date | null;
  setParticipants: (participants: Participant[]) => void;
  setUnauthorised: (value: UnauthorizedAccessPayload | null) => void;
  setSession: (
    session: Session | null | ((prev: Session | null) => Session | null),
  ) => void;
  setTimer: (timer: Date | null) => void;
};

export const useGameStore = create<GameStore>((set, get) => ({
  participants: [],
  unauthorised: null,
  session: null,
  timer: null,
  setParticipants: (participants) => set({ participants }),
  setUnauthorised: (unauthorised) => set({ unauthorised }),
  setSession: (session) => {
    if (typeof session === 'function') {
      set({ session: session(get().session) });
    } else {
      set({ session });
    }
  },
  setTimer: (timer) => set({ timer }),
}));
