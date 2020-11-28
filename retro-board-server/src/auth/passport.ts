import passport from 'passport';
import { Strategy as LocalStrategy, IVerifyOptions } from 'passport-local';
import { Strategy as TwitterStrategy } from 'passport-twitter';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { Strategy as GithubStrategy } from 'passport-github';
import { Strategy as SlackStrategy } from 'passport-slack';
import {
  TWITTER_CONFIG,
  GOOGLE_CONFIG,
  GITHUB_CONFIG,
  SLACK_CONFIG,
} from './config';
import { v4 } from 'uuid';
import { AccountType } from '@retrospected/common';
import chalk from 'chalk';
import loginAnonymous from './logins/anonymous-user';
import loginUser from './logins/password-user';
import UserEntity from '../db/entities/User';
import {
  BaseProfile,
  TwitterProfile,
  GoogleProfile,
  GitHubProfile,
  SlackProfile,
} from './types';
import { getOrSaveUser } from '../db/actions/users';
import { Connection } from 'typeorm';

export default (connection: Connection) => {
  passport.serializeUser((user: string, cb) => {
    cb(null, user);
  });
  passport.deserializeUser(async (userId: string, cb) => {
    cb(null, userId);
  });

  function callback(type: AccountType) {
    return async (
      _accessToken: string,
      _refreshToken: string,
      anyProfile: any,
      cb: Function
    ) => {
      const profile = anyProfile as BaseProfile;
      let user: UserEntity;
      switch (type) {
        case 'google':
          user = buildFromGoogleProfile(profile as GoogleProfile);
          break;
        case 'github':
          user = buildFromGitHubProfile(profile as GitHubProfile);
          break;
        case 'twitter':
          user = buildFromTwitterProfile(profile as TwitterProfile);
          break;
        case 'slack':
          user = buildFromSlackProfile(profile as SlackProfile);
          break;
        default:
          throw new Error('Unknown provider: ' + type);
      }

      const dbUser = await getOrSaveUser(connection, user);
      cb(null, dbUser.id);
    };
  }

  function buildFromTwitterProfile(profile: TwitterProfile): UserEntity {
    const user: UserEntity = new UserEntity(v4(), profile.displayName);
    user.accountType = 'twitter';
    user.language = 'en';
    user.photo = profile.photos?.length ? profile.photos[0].value : null;
    user.username = profile.username;
    user.email = profile.emails.length ? profile.emails[0].value : null;
    return user;
  }

  function buildFromGitHubProfile(profile: GitHubProfile): UserEntity {
    const displayName =
      profile.displayName ||
      profile.username ||
      (profile.emails.length ? profile.emails[0].value : '');

    const user: UserEntity = new UserEntity(v4(), displayName);
    const email = profile.emails
      ? profile.emails.find((e) => e.primary) || null
      : null;
    user.accountType = 'github';
    user.language = 'en';
    user.photo = profile.photos?.length ? profile.photos[0].value : null;
    user.username = profile.username;
    user.email = email ? email.value : null;
    return user;
  }

  function buildFromGoogleProfile(profile: GoogleProfile): UserEntity {
    const user: UserEntity = new UserEntity(v4(), profile.displayName);
    const email = profile.emails.length ? profile.emails[0].value : null;
    user.accountType = 'google';
    user.language = 'en';
    user.photo = profile.photos?.length ? profile.photos[0].value : null;
    user.username = email;
    user.email = email;
    return user;
  }

  function buildFromSlackProfile(profile: SlackProfile): UserEntity {
    const user: UserEntity = new UserEntity(v4(), profile.displayName);
    const email = profile.user.email;
    user.accountType = 'slack';
    user.language = 'en';
    user.photo = profile.user.image_192;
    user.username = email;
    user.email = email;
    return user;
  }

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

  if (SLACK_CONFIG) {
    passport.use(new SlackStrategy(SLACK_CONFIG, callback('slack')));
    console.log(chalk`{blue 🔑  {red Slack} authentication activated}`);
  }

  passport.use(
    new LocalStrategy(
      { passwordField: 'password', usernameField: 'username' },
      async (
        username: string,
        password: string,
        done: (error: any, user?: any, options?: IVerifyOptions) => void
      ) => {
        if (password && password !== '<<<<<NONE>>>>>') {
          const user = await loginUser(connection, username, password);
          done(!user ? 'User cannot log in' : null, user?.id);
        } else {
          const user = await loginAnonymous(connection, username);
          done(null, user.id);
        }
      }
    )
  );
};
