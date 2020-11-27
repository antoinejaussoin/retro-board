declare namespace Express {
  type User = string;

  interface Request {
    buf: Buffer;
  }

  interface Session {
    socketId: string;
    passport: {
      user: User;
    };
  }
}

declare module 'passport-slack';
