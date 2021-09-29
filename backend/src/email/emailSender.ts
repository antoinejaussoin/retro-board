import sendGrid, { MailDataRequired } from '@sendgrid/mail';
import config from '../config';
import randomWords from 'random-words';

if (config.SENDGRID_API_KEY) {
  sendGrid.setApiKey(config.SENDGRID_API_KEY);
}

export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
) {
  if (!config.SENDGRID_API_KEY) {
    throw Error('Sendgrid is not activated.');
  }
  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: config.SENDGRID_VERIFICATION_EMAIL_TID,
    dynamicTemplateData: {
      name,
      code,
      domain: config.BASE_URL,
      email: encodeURIComponent(email),
    },
  };
  try {
    await sendGrid.send(msg);
  } catch (e) {
    console.error('Send grid error: ', e);
  }
}

export async function sendResetPassword(
  email: string,
  name: string,
  code: string
) {
  if (!config.SENDGRID_API_KEY) {
    throw Error('Sendgrid is not activated.');
  }
  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: config.SENDGRID_RESET_PASSWORD_TID,
    dynamicTemplateData: {
      name,
      code,
      domain: config.BASE_URL,
      email: encodeURIComponent(email),
    },
  };
  try {
    await sendGrid.send(msg);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Send grid error: ', e, (e as any).response.body);
  }
}

function generatePassword(): string {
  return randomWords(4).join('-');
}

export async function sendSelfHostWelcome(
  email: string,
  name: string,
  key: string
) {
  if (!config.SENDGRID_API_KEY) {
    throw Error('Sendgrid is not activated.');
  }

  const dbPassword = generatePassword();
  const pgAdminPassword = generatePassword();
  const sessionSecret = generatePassword();

  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: config.SENDGRID_SELF_HOST_EMAIL_TID,
    dynamicTemplateData: {
      name,
      key,
      dbPassword,
      pgAdminPassword,
      sessionSecret,
      email,
    },
  };
  try {
    await sendGrid.send(msg);
  } catch (e) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    console.error('Send grid error: ', e, (e as any).response.body);
  }
}
