import ReactGA from 'react-ga';
import { TrackingEvent } from 'retro-board-common';
import * as Sentry from '@sentry/browser';
import { getConfig } from './utils/getConfig';

const config = getConfig();

export const initialiseAnalytics = () => {
  if (isGAEnabled()) {
    ReactGA.initialize(config.GoogleAnalyticsId);
  }
};

export const initialiseSentry = () => {
  if (config.hasSentry) {
    Sentry.init({
      dsn: config.SentryUrl,
    });
  }
};

export const trackAction = (event: string) => {
  if (isGAEnabled()) {
    ReactGA.event({
      category: 'Action',
      action: event.replace('retrospected/', ''),
    });
  }
};

export const trackEvent = (event: TrackingEvent) => {
  if (isGAEnabled()) {
    ReactGA.event({
      category: 'Event',
      action: event,
    });
  }
};

export const trackPageView = (path: string) => {
  if (isGAEnabled()) {
    ReactGA.pageview(path);
  }
};

const isGAEnabled = () => {
  return process.env.NODE_ENV === 'production' && config.hasGA;
};
