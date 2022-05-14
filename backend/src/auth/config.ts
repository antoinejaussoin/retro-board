import { IStrategyOption } from 'passport-twitter';
import { StrategyOptions as GoogleStrategyOptions } from 'passport-google-oauth20';
import { StrategyOptions as GitHubStrategy } from 'passport-github2';
import { MicrosoftStrategyOptions } from 'passport-microsoft';
import { OktaStrategyOptions } from 'passport-okta-oauth20';
import config from '../config';

const providers = ['twitter', 'google', 'github', 'slack', 'microsoft', 'okta'];

const CLIENT_ORIGIN = config.BASE_URL || 'http://localhost:3000';

const callbacks = providers.map((provider) => {
  return `${CLIENT_ORIGIN}/api/auth/${provider}/callback`;
});

const [twitterURL, googleURL, githubURL, slackURL, microsoftURL, oktaURL] =
  callbacks;

export const TWITTER_CONFIG: IStrategyOption | null =
  config.TWITTER_KEY && config.TWITTER_SECRET
    ? {
        consumerKey: config.TWITTER_KEY || '',
        consumerSecret: config.TWITTER_SECRET || '',
        callbackURL: twitterURL,
        includeEmail: true,
      }
    : null;

export const GOOGLE_CONFIG: GoogleStrategyOptions | null =
  config.GOOGLE_KEY && config.GOOGLE_SECRET
    ? {
        clientID: config.GOOGLE_KEY || '',
        clientSecret: config.GOOGLE_SECRET || '',
        callbackURL: googleURL,
      }
    : null;

export const GITHUB_CONFIG: GitHubStrategy | null =
  config.GITHUB_KEY && config.GITHUB_SECRET
    ? {
        clientID: config.GITHUB_KEY || '',
        clientSecret: config.GITHUB_SECRET || '',
        callbackURL: githubURL,
        scope: ['user:email'],
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
      }
    : null;

export const MICROSOFT_CONFIG: MicrosoftStrategyOptions | null =
  config.MICROSOFT_KEY && config.MICROSOFT_SECRET
    ? {
        clientID: config.MICROSOFT_KEY || '',
        clientSecret: config.MICROSOFT_SECRET || '',
        callbackURL: microsoftURL,
        scope: ['user.read'],
      }
    : null;

export const OKTA_CONFIG: OktaStrategyOptions | null =
  config.OKTA_AUDIENCE && config.OKTA_KEY && config.OKTA_SECRET
    ? {
        audience: config.OKTA_AUDIENCE,
        clientID: config.OKTA_KEY,
        clientSecret: config.OKTA_SECRET,
        scope: ['openid', 'email', 'profile'],
        callbackURL: oktaURL,
      }
    : null;
