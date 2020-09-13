import passport from 'passport';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GithubStrategy } from 'passport-github';
import { TWITTER_CONFIG, GOOGLE_CONFIG, GITHUB_CONFIG } from './config';
import { Store } from '../types';
import { v4 } from 'uuid';
import { User, AccountType } from 'retro-board-common';
import chalk from 'chalk';

export default (store: Store) => {
  // Allowing passport to serialize and deserialize users into sessions
  passport.serializeUser((user: User, cb) => {
    cb(null, user.id);
  });
  passport.deserializeUser(async (userId: string, cb) => {
    cb(null, userId);
  });

  // The callback that is invoked when an OAuth provider sends back user
  // information. Normally, you would save the user to the database
  // in this callback and it would be customized for each provider
  const callback = (type: AccountType) => async (
    _accessToken: string,
    _refreshToken: string,
    profile: any,
    cb: Function
  ) => {
    const user: User = {
      accountType: type,
      id: v4(),
      name: profile.displayName,
      photo: profile.photos?.length ? profile.photos[0].value : null,
      language: 'en',
      username:
        profile.username ||
        (profile.emails.length ? profile.emails[0].value : null),
    };
    const dbUser = await store.getOrSaveUser(user);
    cb(null, dbUser);
  };

  // Adding each OAuth provider's strategy to passport
  if (TWITTER_CONFIG) {
    passport.use(new TwitterStrategy(TWITTER_CONFIG, callback('twitter')));
    console.log(chalk`{blue 🔑  {red Twitter} authentication activated}`);
  }

  if (GOOGLE_CONFIG) {
    passport.use(new GoogleStrategy(GOOGLE_CONFIG, callback('google')));
    console.log(chalk`{blue 🔑  {red Google} authentication activated}`);
  }

  if (GITHUB_CONFIG) {
    passport.use(new GithubStrategy(GITHUB_CONFIG, callback('github')));
    console.log(chalk`{blue 🔑  {red GitHub} authentication activated}`);
  }

  passport.use(
    new LocalStrategy(
      { passwordField: 'password', usernameField: 'username' },
      async (
        username: string,
        _password: string,
        done: (error: any, user?: any, options?: IVerifyOptions) => void
      ) => {
        const user: User = {
          accountType: 'anonymous',
          id: v4(),
          name: username,
          photo: null,
          username: username,
          language: 'en',
        };
        const dbUser = await store.getOrSaveUser(user);
        done(null, dbUser);
      }
    )
  );
};
