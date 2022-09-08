import config from './config';
import * as Sentry from '@sentry/node';
import chalk from 'chalk';
import { Express, Request } from 'express';
import { version } from '../package.json';
import { QueryFailedError } from 'typeorm';
import { throttle } from 'lodash';

const useSentry = !!config.SENTRY_URL && config.SENTRY_URL !== 'NO_SENTRY';

type ConfigureScopeFn = (scope: Sentry.Scope | null) => void;

export const throttledManualReport = throttle(manualReport, 60000, {
  trailing: true,
  leading: true,
});

export function manualReport(message: string, request?: Request) {
  if (useSentry) {
    console.log(' ==> reporting to sentry');
    Sentry.captureEvent({
      message,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      request: request as any,
    });
  }
}

export function manualMessage(message: string) {
  if (useSentry) {
    Sentry.captureMessage(message, 'error');
  }
}

export function initSentry() {
  if (useSentry) {
    Sentry.init({
      dsn: config.SENTRY_URL,
      release: `backend@${version}`,
    });
    console.log(
      chalk`{yellow 🐜  Using {red Sentry} for error reporting} {blue ${version}}`
    );
  }
}

export function setupSentryRequestHandler(app: Express) {
  if (useSentry) {
    app.use(Sentry.Handlers.requestHandler());
  }
}

export function setupSentryErrorHandler(app: Express) {
  if (useSentry) {
    app.use(Sentry.Handlers.errorHandler());
  }
}

export function setScope(fn: ConfigureScopeFn) {
  if (useSentry) {
    Sentry.configureScope(fn);
  } else {
    fn(null);
  }
}

export function reportQueryError(
  scope: Sentry.Scope | null,
  err: QueryFailedError
) {
  if (err instanceof QueryFailedError && scope) {
    const queryError = err;
    scope.setExtra('Query', queryError.query);
    scope.setExtra('Parameters', queryError.parameters);

    console.error(
      'Query error: ',
      queryError.query,
      queryError.parameters,
      err
    );
  } else {
    console.error('Unknown error: ', err);
  }
}
