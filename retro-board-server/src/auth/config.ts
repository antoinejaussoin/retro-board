import { IStrategyOption } from 'passport-twitter';
import { IOAuth2StrategyOption } from 'passport-google-oauth';
import { StrategyOptions as GitHubStrategy } from 'passport-github2';
import config from '../db/config';

const providers = ['twitter', 'google', 'github', 'slack'];

const CLIENT_ORIGIN = config.BASE_URL || 'http://localhost:3000';

const callbacks = providers.map((provider) => {
  return `${CLIENT_ORIGIN}/api/auth/${provider}/callback`;
});

const [twitterURL, googleURL, githubURL, slackURL] = callbacks;

export const TWITTER_CONFIG: IStrategyOption | null =
  config.TWITTER_KEY && config.TWITTER_SECRET
    ? {
        consumerKey: config.TWITTER_KEY || '',
        consumerSecret: config.TWITTER_SECRET || '',
        callbackURL: twitterURL,
        includeEmail: true,
      }
    : null;

export const GOOGLE_CONFIG: IOAuth2StrategyOption | null =
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
        clientID: config.SLACK_KEY || '',
        clientSecret: config.SLACK_SECRET || '',
        callbackURL: slackURL,
        scope: ['identity.email', 'identity.avatar', 'identity.basic'],
      }
    : null;
