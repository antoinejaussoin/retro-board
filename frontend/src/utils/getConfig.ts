interface HtmlConfig {
  GOOGLE_ANALYTICS_ID: string;
  SENTRY_URL: string;
  GIPHY_API_KEY: string;
  STRIPE_KEY: string;
  AUTH_GOOGLE_ENABLED: string;
  AUTH_TWITTER_ENABLED: string;
  AUTH_GITHUB_ENABLED: string;
  AUTH_SLACK_ENABLED: string;
  AUTH_MICROSOFT_ENABLED: string;
  DEFAULT_LANGUAGE: string;
  VERSION: string;
}

interface Config {
  hasGA: boolean;
  hasSentry: boolean;
  hasGiphy: boolean;
  GoogleAnalyticsId: string;
  SentryUrl: string;
  GiphyApiKey: string;
  StripeKey: string;
  GoogleAuthEnabled: boolean;
  TwitterAuthEnabled: boolean;
  GitHubAuthEnabled: boolean;
  SlackAuthEnabled: boolean;
  MicrosoftAuthEnabled: boolean;
  defaultLanguage: string;
  version: string;
}

declare global {
  interface Window {
    __env__: HtmlConfig;
  }
}

window.__env__ = window.__env__ || {};

function getKey(
  key:
    | 'GOOGLE_ANALYTICS_ID'
    | 'SENTRY_URL'
    | 'GIPHY_API_KEY'
    | 'STRIPE_KEY'
    | 'DEFAULT_LANGUAGE'
    | 'AUTH_GOOGLE_ENABLED'
    | 'AUTH_TWITTER_ENABLED'
    | 'AUTH_GITHUB_ENABLED'
    | 'AUTH_SLACK_ENABLED'
    | 'AUTH_MICROSOFT_ENABLED',
  noValue: string,
  defaultValue?: string
): string {
  if (process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`] || '';
  }
  if (!!window.__env__[key] && window.__env__[key] !== noValue) {
    return window.__env__[key];
  }
  return defaultValue || '';
}

function getConfig(): Config {
  const googleAnalyticsId = getKey('GOOGLE_ANALYTICS_ID', 'NO_GA');
  const sentryUrl = getKey('SENTRY_URL', 'NO_SENTRY');
  const giphyApiKey = getKey('GIPHY_API_KEY', 'NO_GIPHY');
  const stripeKey = getKey('STRIPE_KEY', 'NO_STRIPE');
  const defaultLanguage = getKey(
    'DEFAULT_LANGUAGE',
    'NO_DEFAULT_LANGUAGE',
    'en'
  );
  const isGoogleAuthEnabled =
    getKey('AUTH_GOOGLE_ENABLED', 'NO_AUTH_GOOGLE_ENABLED').toLowerCase() ===
    'true';
  const isTwitterAuthEnabled =
    getKey('AUTH_TWITTER_ENABLED', 'NO_AUTH_TWITTER_ENABLED').toLowerCase() ===
    'true';
  const isGitHubAuthEnabled =
    getKey('AUTH_GITHUB_ENABLED', 'NO_AUTH_GITHUB_ENABLED').toLowerCase() ===
    'true';
  const isSlackAuthEnabled =
    getKey('AUTH_SLACK_ENABLED', 'NO_AUTH_SLACK_ENABLED').toLowerCase() ===
    'true';
  const isMicrosoftAuthEnabled =
    getKey(
      'AUTH_MICROSOFT_ENABLED',
      'NO_AUTH_MICROSOFT_ENABLED'
    ).toLowerCase() === 'true';

  return {
    hasGA: !!googleAnalyticsId,
    hasSentry: !!sentryUrl,
    hasGiphy: !!giphyApiKey,
    GoogleAnalyticsId: googleAnalyticsId,
    SentryUrl: sentryUrl,
    GiphyApiKey: giphyApiKey,
    StripeKey: stripeKey,
    GoogleAuthEnabled: isGoogleAuthEnabled,
    GitHubAuthEnabled: isGitHubAuthEnabled,
    TwitterAuthEnabled: isTwitterAuthEnabled,
    SlackAuthEnabled: isSlackAuthEnabled,
    MicrosoftAuthEnabled: isMicrosoftAuthEnabled,
    defaultLanguage: defaultLanguage,
    version: window.__env__['VERSION'],
  };
}

export default getConfig();
