import sendGrid, { MailDataRequired } from '@sendgrid/mail';
import config from '../db/config';

sendGrid.setApiKey(config.SENDGRID_API_KEY);

export async function sendVerificationEmail(
  email: string,
  name: string,
  code: string
) {
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
    console.error('Send grid error: ', e, e.response.body);
  }
}
