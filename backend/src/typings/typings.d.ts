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

declare module 'freemail';
declare module 'passport-slack-oauth2';
declare module '@passport-js/passport-twitter' {
  interface IStrategyOptionBase {
    consumerKey: string;
    consumerSecret: string;
    callbackURL: string;

    includeEmail?: boolean | undefined;
    includeStatus?: boolean | undefined;
    includeEntities?: boolean | undefined;

    requestTokenURL?: string | undefined;
    accessTokenURL?: string | undefined;
    userAuthorizationURL?: string | undefined;
    sessionKey?: string | undefined;

    forceLogin?: boolean | undefined;
    screenName?: string | undefined;

    userProfileURL?: string | undefined;
    skipExtendedUserProfile?: boolean | undefined;
  }

  interface IStrategyOption extends IStrategyOptionBase {
    passReqToCallback?: false | undefined;
  }

  interface IStrategyOptionWithRequest extends IStrategyOptionBase {
    passReqToCallback: true;
  }

  declare class Strategy extends passport.Strategy {
    constructor(
      options: IStrategyOption,
      verify: (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        done: (error: any, user?: any) => void
      ) => void
    );
    constructor(
      options: IStrategyOptionWithRequest,
      verify: (
        req: express.Request,
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        done: (error: any, user?: any) => void
      ) => void
    );

    name: string;
    authenticate(req: express.Request, options?: unknown): void;
  }
}
