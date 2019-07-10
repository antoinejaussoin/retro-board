import { Session, User } from 'retro-board-common';

export interface Action {
  type: string;
  payload?: any;
}

export interface State {
  panelOpen: boolean;
  username: User | null;
  players: User[];
  session: Session;
  summaryMode: boolean;
}

export type Dispatch = (action: Action) => void;
