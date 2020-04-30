interface HtmlConfig {
  GOOGLE_ANALYTICS_ID: string;
  SENTRY_URL: string;
  GIPHY_API_KEY: string;
  AUTH_GOOGLE_ENABLED: string;
  AUTH_TWITTER_ENABLED: string;
  AUTH_GITHUB_ENABLED: string;
  VERSION: string;
}

interface Config {
  hasGA: boolean;
  hasSentry: boolean;
  hasGiphy: boolean;
  GoogleAnalyticsId: string;
  SentryUrl: string;
  GiphyApiKey: string;
  GoogleAuthEnabled: boolean;
  TwitterAuthEnabled: boolean;
  GitHubAuthEnabled: boolean;
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
    | 'AUTH_GOOGLE_ENABLED'
    | 'AUTH_TWITTER_ENABLED'
    | 'AUTH_GITHUB_ENABLED',
  noValue: string
): string {
  if (process.env[`REACT_APP_${key}`]) {
    return process.env[`REACT_APP_${key}`] || '';
  }
  if (!!window.__env__[key] && window.__env__[key] !== noValue) {
    return window.__env__[key];
  }
  return '';
}

function getConfig(): Config {
  const googleAnalyticsId = getKey('GOOGLE_ANALYTICS_ID', 'NO_GA');
  const sentryUrl = getKey('SENTRY_URL', 'NO_SENTRY');
  const giphyApiKey = getKey('GIPHY_API_KEY', 'NO_GIPHY');
  const isGoogleAuthEnabled =
    getKey('AUTH_GOOGLE_ENABLED', 'NO_AUTH_GOOGLE_ENABLED').toLowerCase() ===
    'true';
  const isTwitterAuthEnabled =
    getKey('AUTH_TWITTER_ENABLED', 'NO_AUTH_TWITTER_ENABLED').toLowerCase() ===
    'true';
  const isGitHubAuthEnabled =
    getKey('AUTH_GITHUB_ENABLED', 'NO_AUTH_GITHUB_ENABLED').toLowerCase() ===
    'true';

  return {
    hasGA: !!googleAnalyticsId,
    hasSentry: !!sentryUrl,
    hasGiphy: !!giphyApiKey,
    GoogleAnalyticsId: googleAnalyticsId,
    SentryUrl: sentryUrl,
    GiphyApiKey: giphyApiKey,
    GoogleAuthEnabled: isGoogleAuthEnabled,
    GitHubAuthEnabled: isGitHubAuthEnabled,
    TwitterAuthEnabled: isTwitterAuthEnabled,
    version: window.__env__['VERSION'],
  };
}

export default getConfig();
