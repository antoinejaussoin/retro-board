import fs from 'fs';
import path from 'path';
import { BackendConfig } from './types';
import dotenv from 'dotenv';
const confPath = path.resolve(__dirname, '../../.env');
const defaultConfPath = path.resolve(__dirname, '../../.env.example');

const fileExist = fs.existsSync(confPath);

if (fileExist) {
  dotenv.config({ path: confPath });
} else {
  dotenv.config({ path: defaultConfPath });
}

function defaults(key: string, defaultValue: string): string {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return process.env[key]!;
}

function defaultsBool(key: string, defaultValue: boolean): boolean {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return process.env[key]! === 'true';
}

function defaultsNumber(key: string, defaultValue: number): number {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return parseInt(process.env[key]!);
}

const config: BackendConfig = {
  LICENCE_KEY: defaults('LICENCE_KEY', ''),
  SELF_HOSTED: defaultsBool('SELF_HOSTED', false),
  SELF_HOSTED_ADMIN: defaults('SELF_HOSTED_ADMIN', 'admin@acme.com'),
  DB_NAME: defaults('DB_NAME', 'retroboard'),
  DB_USER: defaults('DB_USER', 'postgres'),
  DB_PASSWORD: defaults('DB_PASSWORD', 'postgres'),
  DB_HOST: defaults('DB_HOST', 'postgres'),
  DB_PORT: defaultsNumber('DB_PORT', 5432),
  REDIS_ENABLED: defaultsBool('REDIS_ENABLED', true),
  REDIS_FOR_SOCKETIO_ENABLED: defaultsBool('REDIS_FOR_SOCKETIO_ENABLED', false),
  REDIS_HOST: defaults('REDIS_HOST', 'redis'),
  REDIS_PORT: defaultsNumber('REDIS_PORT', 6379),
  BACKEND_PORT: defaultsNumber('BACKEND_PORT', 3201),
  SESSION_SECRET: defaults('SESSION_SECRET', 'changeme'),
  SQL_LOG: defaultsBool('SQL_LOG', false),
  SENTRY_URL: defaults('SENTRY_URL', ''),
  BASE_URL: defaults('BASE_URL', 'http://localhost:80'),
  TWITTER_KEY: defaults('TWITTER_KEY', ''),
  TWITTER_SECRET: defaults('TWITTER_SECRET', ''),
  GOOGLE_KEY: defaults('GOOGLE_KEY', ''),
  GOOGLE_SECRET: defaults('GOOGLE_SECRET', ''),
  GITHUB_KEY: defaults('GITHUB_KEY', ''),
  GITHUB_SECRET: defaults('GITHUB_SECRET', ''),
  SLACK_KEY: defaults('SLACK_KEY', ''),
  SLACK_SECRET: defaults('SLACK_SECRET', ''),
  MICROSOFT_KEY: defaults('MICROSOFT_KEY', ''),
  MICROSOFT_SECRET: defaults('MICROSOFT_SECRET', ''),
  SENDGRID_API_KEY: defaults('SENDGRID_API_KEY', ''),
  SENDGRID_SENDER: defaults('SENDGRID_SENDER', ''),
  SENDGRID_VERIFICATION_EMAIL_TID: defaults(
    'SENDGRID_VERIFICATION_EMAIL_TID',
    ''
  ),
  SENDGRID_RESET_PASSWORD_TID: defaults('SENDGRID_RESET_PASSWORD_TID', ''),
  SENDGRID_SELF_HOST_EMAIL_TID: defaults('SENDGRID_SELF_HOST_EMAIL_TID', ''),
  STRIPE_SECRET: defaults('STRIPE_SECRET', ''),
  STRIPE_WEBHOOK_SECRET: defaults('STRIPE_WEBHOOK_SECRET', ''),
  STRIPE_TEAM_PRODUCT: defaults('STRIPE_TEAM_PRODUCT', ''),
  STRIPE_TEAM_PRICE: defaults('STRIPE_TEAM_PRICE', ''),
  STRIPE_UNLIMITED_PRODUCT: defaults('STRIPE_UNLIMITED_PRODUCT', ''),
  STRIPE_UNLIMITED_PRICE: defaults('STRIPE_UNLIMITED_PRICE', ''),
  STRIPE_SELF_HOSTED_PRODUCT: defaults('STRIPE_SELF_HOSTED_PRODUCT', ''),
  STRIPE_SELF_HOSTED_URL_GBP: defaults('STRIPE_SELF_HOSTED_URL_GBP', ''),
  STRIPE_SELF_HOSTED_URL_EUR: defaults('STRIPE_SELF_HOSTED_URL_EUR', ''),
  STRIPE_SELF_HOSTED_URL_USD: defaults('STRIPE_SELF_HOSTED_URL_USD', ''),
  RATE_LIMIT_WINDOW: defaultsNumber('RATE_LIMIT_WINDOW', 10000),
  RATE_LIMIT_MAX: defaultsNumber('RATE_LIMIT_MAX', 3),
  RATE_LIMIT_WS_POINTS: defaultsNumber('RATE_LIMIT_WS_POINTS', 10),
  RATE_LIMIT_WS_DURATION: defaultsNumber('RATE_LIMIT_WS_DURATION', 1),
  WS_MAX_BUFFER_SIZE: defaultsNumber('WS_MAX_BUFFER_SIZE', 100000),
};

console.log('Config: ', config);

export default config;
