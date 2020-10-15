import sendGrid, { MailDataRequired } from '@sendgrid/mail';
import config from '../db/config';

sendGrid.setApiKey(config.SENDGRID_API_KEY);

export async function sendVerificationEmail(email: string, name: string, verificationCode: string) {
  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: 'd-ae1f003b9c5145f99dbb6ef6095c865f', // TODO: parameterise that
    dynamicTemplateData: {
      name,
      code: verificationCode,
      domain: config.BASE_URL,
      email: encodeURIComponent(email),
    }
  }
  try {
    const [response] = await sendGrid.send(msg);
  } catch (e){
    console.error('Send grid error: ', e);
  }
}