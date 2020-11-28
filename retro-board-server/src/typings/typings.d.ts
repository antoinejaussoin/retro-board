declare namespace Express {
  type User = string;

  interface Request {
    buf: Buffer;
    session: Session;
  }

  interface Session {
    socketId: string;
    passport: {
      user: User;
    };
  }
}

declare module 'passport-slack';
