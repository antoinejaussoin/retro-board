// xxbiome-ignore lint/style/noNamespace: Temporary
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
    destroy: (err: unknown) => unknown | Response<unknown, number>;
  }
}

declare module 'freemail';
declare module 'passport-slack-oauth2';
