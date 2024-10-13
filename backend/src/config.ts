import fs from 'node:fs';
import path from 'node:path';
import type { BackendConfig } from './types.js';
import dotenv from 'dotenv';
import { getDirname } from './path-utils.js';

function findDotEnvPath(): string | null {
  let current = getDirname(import.meta.url);
  for (let i = 0; i < 5; i++) {
    const custom = path.resolve(current, '.env');
    const example = path.resolve(current, '.env.example');
    if (fs.existsSync(custom)) {
      return custom;
    }
    if (fs.existsSync(example)) {
      return example;
    }
    current = path.resolve(current, '..');
  }
  return null;
}

const dotEnvPath = findDotEnvPath();
if (dotEnvPath) {
  dotenv.config({ path: dotEnvPath });
}

function defaults(key: string, defaultValue: string): string {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return process.env[key];
}

function defaultsBool(key: string, defaultValue: boolean): boolean {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return process.env[key] === 'true';
}

function defaultsNumber(key: string, defaultValue: number): number {
  if (process.env[key] === undefined) {
    return defaultValue;
  }
  return Number.parseInt(process.env[key]);
}

function defaultsUndefined(key: string): string | undefined {
  if (process.env[key] === undefined) {
    return undefined;
  }
  return process.env[key];
}

const config: BackendConfig = {
  LICENCE_KEY: defaults('LICENCE_KEY', ''),
  SELF_HOSTED: defaultsBool('SELF_HOSTED', true),
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
  SECURE_COOKIES: defaultsBool('SECURE_COOKIES', false),
  DISABLE_ANONYMOUS_LOGIN: defaultsBool('DISABLE_ANONYMOUS_LOGIN', false),
  DISABLE_PASSWORD_LOGIN: defaultsBool('DISABLE_PASSWORD_LOGIN', false),
  DISABLE_PASSWORD_REGISTRATION: defaultsBool(
    'DISABLE_PASSWORD_REGISTRATION',
    false,
  ),
  TWITTER_KEY: defaults('TWITTER_KEY', ''),
  TWITTER_SECRET: defaults('TWITTER_SECRET', ''),
  GOOGLE_KEY: defaults('GOOGLE_KEY', ''),
  GOOGLE_SECRET: defaults('GOOGLE_SECRET', ''),
  GITHUB_KEY: defaults('GITHUB_KEY', ''),
  GITHUB_SECRET: defaults('GITHUB_SECRET', ''),
  SLACK_KEY: defaults('SLACK_KEY', ''),
  SLACK_SECRET: defaults('SLACK_SECRET', ''),
  SLACK_BOT_ENABLE: defaultsBool('SLACK_BOT_ENABLE', false),
  MICROSOFT_KEY: defaults('MICROSOFT_KEY', ''),
  MICROSOFT_SECRET: defaults('MICROSOFT_SECRET', ''),
  MICROSOFT_TENANT: defaultsUndefined('MICROSOFT_TENANT'),
  MICROSOFT_AUTHORIZATION_URL: defaultsUndefined('MICROSOFT_AUTHORIZATION_URL'),
  MICROSOFT_TOKEN_URL: defaultsUndefined('MICROSOFT_TOKEN_URL'),
  OKTA_AUDIENCE: defaults('OKTA_AUDIENCE', ''),
  OKTA_KEY: defaults('OKTA_KEY', ''),
  OKTA_SECRET: defaults('OKTA_SECRET', ''),
  SENDGRID_API_KEY: defaults('SENDGRID_API_KEY', ''),
  SENDGRID_SENDER: defaults('SENDGRID_SENDER', ''),
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
  RATE_LIMIT_WINDOW: defaultsNumber('RATE_LIMIT_WINDOW', 900_000),
  RATE_LIMIT_MAX: defaultsNumber('RATE_LIMIT_MAX', 500),
  RATE_LIMIT_WS_POINTS: defaultsNumber('RATE_LIMIT_WS_POINTS', 600),
  RATE_LIMIT_WS_DURATION: defaultsNumber('RATE_LIMIT_WS_DURATION', 60),
  WS_MAX_BUFFER_SIZE: defaultsNumber('WS_MAX_BUFFER_SIZE', 10_000),
  MAIL_SMTP_HOST: defaults('MAIL_SMTP_HOST', ''),
  MAIL_PORT: defaultsNumber('MAIL_PORT', 465),
  MAIL_SECURE: defaultsBool('MAIL_SECURE', true),
  MAIL_SENDER: defaults('MAIL_SENDER', ''),
  MAIL_USER: defaults('MAIL_USER', ''),
  MAIL_PASSWORD: defaults('MAIL_PASSWORD', ''),
  MAIL_ALLOW_SELF_SIGNED_CERTS: defaultsBool(
    'MAIL_ALLOW_SELF_SIGNED_CERTS',
    false,
  ),
  GA4_SECRET: defaults('GA4_SECRET', ''),
  GA4_MEASUREMENT_ID: defaults('GA4_MEASUREMENT_ID', ''),
  OPEN_AI_API_KEY: defaults('OPEN_AI_API_KEY', ''),
  OPEN_AI_FREE_LIMIT: defaultsNumber('OPEN_AI_FREE_LIMIT', 5),
  OPEN_AI_PAID_LIMIT: defaultsNumber('OPEN_AI_PAID_LIMIT', 100),
  DISABLE_ACCOUNT_DELETION: defaultsBool('DISABLE_ACCOUNT_DELETION', false),
  DISABLE_SHOW_AUTHOR: defaultsBool('DISABLE_SHOW_AUTHOR', false),
};

export default config;
