import chalk from 'chalk';
import config from '../config';
import randomWords from './random-words';
import { sendGridSender } from './sendgrid-sender';
import { smtpSender } from './smtp-sender';
import {
  getPasswordResetTemplate,
  getRegisterTemplate,
  getSelfHostedWelcomeEmailTemplate,
} from './template-loader';
import { EmailSender } from './types';

function getSender(): EmailSender | null {
  if (config.SENDGRID_API_KEY) {
    console.log(
      chalk`📨  {red SendGrid} is going to be used for {yellow emails}`
    );
    return sendGridSender;
  } else if (config.MAIL_SMTP_HOST) {
    console.log(chalk`📨  {red SMTP} is going to be used for {yellow emails}`);
    return smtpSender;
  }

  console.log(
    chalk`📨  {red NO EMAIL PROVIDER CONFIGURED}. It is recommended to setup a SendGrid or SMTP email provider for account management.`
  );
  return null;
}

const send = getSender();

export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
) {
  if (!send) {
    return;
  }
  const template = await getRegisterTemplate(
    encodeURIComponent(email),
    name,
    code,
    config.BASE_URL
  );
  const result = send(
    email,
    'Welcome to Retrospected - Verify your email',
    template
  );
  if (!result) {
    console.error('Sending email did not work');
  }
}

export async function sendResetPassword(
  email: string,
  name: string,
  code: string
) {
  if (!send) {
    return;
  }
  const template = await getPasswordResetTemplate(
    encodeURIComponent(email),
    name,
    code,
    config.BASE_URL
  );
  const result = send(email, 'Retrospected - Reset your password', template);
  if (!result) {
    console.error('Sending email did not work');
  }
}

function generatePassword(): string {
  return randomWords({ exactly: 4 }).join('-');
}

export async function sendSelfHostWelcome(
  email: string,
  name: string,
  key: string
) {
  if (!send) {
    return;
  }
  const dbPassword = generatePassword();
  const pgAdminPassword = generatePassword();
  const sessionSecret = generatePassword();

  const template = await getSelfHostedWelcomeEmailTemplate(
    name,
    key,
    dbPassword,
    pgAdminPassword,
    sessionSecret,
    email
  );
  const result = send(email, 'Welcome to Retrospected Self-Hosted!', template);
  if (!result) {
    console.error('Sending email did not work');
  }
}
