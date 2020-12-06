import fs from 'fs';
import path from 'path';
import { Configuration } from '../types';
import dotenv from 'dotenv';
const confPath = path.resolve(__dirname, '../../../.env');
const defaultConfPath = path.resolve(__dirname, '../../../.env.example');

const fileExist = fs.existsSync(confPath);

if (fileExist) {
  dotenv.config({ path: confPath });
} else {
  dotenv.config({ path: defaultConfPath });
}

const config: Configuration = {
  LICENCE_KEY: process.env.LICENCE_KEY!,
  DB_NAME: process.env.DB_NAME!,
  DB_USER: process.env.DB_USER!,
  DB_PASSWORD: process.env.DB_PASSWORD!,
  DB_HOST: process.env.DB_HOST!,
  DB_PORT: parseInt(process.env.DB_PORT!),
  REDIS_ENABLED: process.env.REDIS_ENABLED === 'true',
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
  SENDGRID_API_KEY: process.env.SENDGRID_API_KEY!,
  SENDGRID_SENDER: process.env.SENDGRID_SENDER!,
  SENDGRID_VERIFICATION_EMAIL_TID: process.env.SENDGRID_VERIFICATION_EMAIL_TID!,
  SENDGRID_RESET_PASSWORD_TID: process.env.SENDGRID_RESET_PASSWORD_TID!,
  STRIPE_SECRET: process.env.STRIPE_SECRET!,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
  STRIPE_TEAM_PRODUCT: process.env.STRIPE_TEAM_PRODUCT!,
  STRIPE_TEAM_PRICE: process.env.STRIPE_TEAM_PRICE!,
  STRIPE_UNLIMITED_PRODUCT: process.env.STRIPE_UNLIMITED_PRODUCT!,
  STRIPE_UNLIMITED_PRICE: process.env.STRIPE_UNLIMITED_PRICE!,
};

export default config;
