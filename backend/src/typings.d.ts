import type { UserIds } from './utils.js';

declare module 'express-serve-static-core' {
  interface Request {
    user?: UserIds | undefined;
    // These declarations are merged into express's Request type
    login(user: UserIds, done: (err: string) => void): void;
    login(user: UserIds, options: unknown, done: (err: string) => void): void;
    logIn(user: UserIds, done: (err: string) => void): void;
    logIn(user: UserIds, options: unknown, done: (err: string) => void): void;
  }

  // That, unfortunately, doesn't quite work.
  interface User extends UserIds {}
}
