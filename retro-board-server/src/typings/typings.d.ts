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
    destroy: (err: unknown) => void | Response<unknown, number>;
  }
}

declare module 'passport-slack';
