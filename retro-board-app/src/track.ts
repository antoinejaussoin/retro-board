import ReactGA from 'react-ga';

export const initialiseAnalytics = () => {
  if (isGAEnabled()) {
    ReactGA.initialize(process.env.REACT_APP_GA_ID!);
  }
};

export const trackEvent = (event: string) => {
  if (isGAEnabled()) {
    ReactGA.event({
      category: 'Action',
      action: event.replace('retrospected/', ''),
    });
  }
};

export const trackPageView = (path: string) => {
  if (isGAEnabled()) {
    ReactGA.pageview(path);
  }
};

const isGAEnabled = () => {
  const enabled =
    process.env.NODE_ENV === 'production' && !!process.env.REACT_APP_GA_ID;
  return enabled;
};
