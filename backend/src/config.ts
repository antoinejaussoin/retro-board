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

const config: BackendConfig = {
  LICENCE_KEY: process.env.LICENCE_KEY!,
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT!),
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
  REDIS_FOR_SOCKETIO_ENABLED: process.env.REDIS_FOR_SOCKETIO_ENABLED === 'true',
  REDIS_HOST: process.env.REDIS_HOST!,
  REDIS_PORT: parseInt(process.env.REDIS_PORT!),
  BACKEND_PORT: parseInt(process.env.BACKEND_PORT!),
  SQL_LOG: process.env.SQL_LOG === 'true',
  SENTRY_URL: process.env.SENTRY_URL!,
  BASE_URL: process.env.BASE_URL!,
  TWITTER_KEY: process.env.TWITTER_KEY!,
  TWITTER_SECRET: process.env.TWITTER_SECRET!,
  GOOGLE_KEY: process.env.GOOGLE_KEY!,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET!,
  GITHUB_KEY: process.env.GITHUB_KEY!,
  GITHUB_SECRET: process.env.GITHUB_SECRET!,
  SLACK_KEY: process.env.SLACK_KEY!,
  SLACK_SECRET: process.env.SLACK_SECRET!,
  MICROSOFT_KEY: process.env.MICROSOFT_KEY!,
  MICROSOFT_SECRET: process.env.MICROSOFT_SECRET!,
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  SENDGRID_SENDER: process.env.SENDGRID_SENDER!,
  SENDGRID_VERIFICATION_EMAIL_TID: process.env.SENDGRID_VERIFICATION_EMAIL_TID!,
  SENDGRID_RESET_PASSWORD_TID: process.env.SENDGRID_RESET_PASSWORD_TID!,
  SENDGRID_SELF_HOST_EMAIL_TID: process.env.SENDGRID_SELF_HOST_EMAIL_TID!,
  STRIPE_SECRET: process.env.STRIPE_SECRET!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  STRIPE_TEAM_PRODUCT: process.env.STRIPE_TEAM_PRODUCT!,
  STRIPE_TEAM_PRICE: process.env.STRIPE_TEAM_PRICE!,
  STRIPE_UNLIMITED_PRODUCT: process.env.STRIPE_UNLIMITED_PRODUCT!,
  STRIPE_UNLIMITED_PRICE: process.env.STRIPE_UNLIMITED_PRICE!,
  STRIPE_SELF_HOSTED_PRODUCT: process.env.STRIPE_SELF_HOSTED_PRODUCT!,
  STRIPE_SELF_HOSTED_URL_GBP: process.env.STRIPE_SELF_HOSTED_URL_GBP!,
  STRIPE_SELF_HOSTED_URL_EUR: process.env.STRIPE_SELF_HOSTED_URL_EUR!,
  STRIPE_SELF_HOSTED_URL_USD: process.env.STRIPE_SELF_HOSTED_URL_USD!,
  RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW!),
  RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX!),
  RATE_LIMIT_WS_POINTS: parseInt(process.env.RATE_LIMIT_WS_POINTS!),
  RATE_LIMIT_WS_DURATION: parseInt(process.env.RATE_LIMIT_WS_DURATION!),
  WS_MAX_BUFFER_SIZE: parseInt(process.env.WS_MAX_BUFFER_SIZE!),
};

export default config;
