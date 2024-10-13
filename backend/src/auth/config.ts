import type { IStrategyOptionWithRequest } from 'passport-twitter';
import type { StrategyOptionsWithRequest as GoogleStrategyOptions } from 'passport-google-oauth20';
import type { StrategyOptionsWithRequest as GitHubStrategy } from 'passport-github2';
import type { MicrosoftStrategyOptionsWithRequest } from 'passport-microsoft';
import type { OktaStrategyOptions } from 'passport-okta-oauth20';
import config from '../config.js';

type MicrosoftStrategyOptionsWithTenant =
  MicrosoftStrategyOptionsWithRequest & {
    tenant: string | undefined;
  };

const providers = ['twitter', 'google', 'github', 'slack', 'microsoft', 'okta'];

const CLIENT_ORIGIN = config.BASE_URL || 'http://localhost:3000';

const callbacks = providers.map((provider) => {
  return `${CLIENT_ORIGIN}/api/auth/${provider}/callback`;
});

const [twitterURL, googleURL, githubURL, slackURL, microsoftURL, oktaURL] =
  callbacks;

export const TWITTER_CONFIG: IStrategyOptionWithRequest | null =
  config.TWITTER_KEY && config.TWITTER_SECRET
    ? {
        consumerKey: config.TWITTER_KEY || '',
        consumerSecret: config.TWITTER_SECRET || '',
        callbackURL: twitterURL,
        includeEmail: true,
        passReqToCallback: true,
      }
    : null;

export const GOOGLE_CONFIG: GoogleStrategyOptions | null =
  config.GOOGLE_KEY && config.GOOGLE_SECRET
    ? {
        clientID: config.GOOGLE_KEY || '',
        clientSecret: config.GOOGLE_SECRET || '',
        callbackURL: googleURL,
        passReqToCallback: true,
      }
    : null;

export const GITHUB_CONFIG: GitHubStrategy | null =
  config.GITHUB_KEY && config.GITHUB_SECRET
    ? {
        clientID: config.GITHUB_KEY || '',
        clientSecret: config.GITHUB_SECRET || '',
        callbackURL: githubURL,
        scope: ['user:email'],
        passReqToCallback: true,
      }
    : null;

export const SLACK_CONFIG =
  config.SLACK_KEY && config.SLACK_SECRET
    ? {
        skipUserProfile: false, // default
        scope: [
          'identity.basic',
          'identity.email',
          'identity.avatar',
          'identity.team',
        ], // default
        clientID: config.SLACK_KEY || '',
        clientSecret: config.SLACK_SECRET || '',
        callbackURL: slackURL,
        passReqToCallback: true,
      }
    : null;

export const MICROSOFT_CONFIG: MicrosoftStrategyOptionsWithTenant | null =
  config.MICROSOFT_KEY && config.MICROSOFT_SECRET
    ? {
        clientID: config.MICROSOFT_KEY || '',
        clientSecret: config.MICROSOFT_SECRET || '',
        tenant: config.MICROSOFT_TENANT,
        authorizationURL: config.MICROSOFT_AUTHORIZATION_URL,
        tokenURL: config.MICROSOFT_TOKEN_URL,
        callbackURL: microsoftURL,
        scope: ['user.read'],
        passReqToCallback: true,
      }
    : null;

export const OKTA_CONFIG:
  | (OktaStrategyOptions & { passReqToCallback: true })
  | null =
  config.OKTA_AUDIENCE && config.OKTA_KEY && config.OKTA_SECRET
    ? {
        audience: config.OKTA_AUDIENCE,
        clientID: config.OKTA_KEY,
        clientSecret: config.OKTA_SECRET,
        scope: ['openid', 'email', 'profile'],
        callbackURL: oktaURL,
        passReqToCallback: true,
      }
    : null;
