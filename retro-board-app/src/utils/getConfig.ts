interface HtmlConfig {
  GOOGLE_ANALYTICS_ID: string;
  SENTRY_URL: string;
}

interface Config {
  hasGA: boolean;
  hasSentry: boolean;
  GoogleAnalyticsId: string;
  SentryUrl: string;
}

declare global {
  interface Window {
    __env__: HtmlConfig;
  }
}

window.__env__ = window.__env__ || {};

export function getConfig(): Config {
  const hasGA =
    !!window.__env__.GOOGLE_ANALYTICS_ID &&
    window.__env__.GOOGLE_ANALYTICS_ID !== 'NO_GA';
  const hasSentry =
    !!window.__env__.SENTRY_URL && window.__env__.SENTRY_URL !== 'NO_SENTRY';
  return {
    hasGA,
    hasSentry,
    GoogleAnalyticsId: hasGA ? window.__env__.GOOGLE_ANALYTICS_ID : '',
    SentryUrl: hasSentry ? window.__env__.SENTRY_URL : '',
  };
}
