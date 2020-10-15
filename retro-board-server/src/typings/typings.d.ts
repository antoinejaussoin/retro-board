// import { User as UserObject } from 'retro-board-common';

declare namespace Express {
  type User = string;

  interface Session {
    socketId: string;
    passport: {
      user: User;
    };
  }
}
