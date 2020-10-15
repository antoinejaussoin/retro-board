import sendGrid, { MailDataRequired } from '@sendgrid/mail';
import config from '../db/config';

sendGrid.setApiKey(config.SENDGRID_API_KEY);

export async function sendVerificationEmail(email: string, name: string, code: string) {
  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: 'd-ae1f003b9c5145f99dbb6ef6095c865f', // TODO: parameterise that
    dynamicTemplateData: {
      name,
      code,
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

export async function sendResetPassword(email: string,name: string,  code: string) {
  const msg: MailDataRequired = {
    to: email,
    from: config.SENDGRID_SENDER,
    templateId: 'd-c1ebafa8412d444caf372d0846389b46', // TODO: parameterise that
    dynamicTemplateData: {
      name,
      code,
      domain: config.BASE_URL,
      email: encodeURIComponent(email),
    }
  }
  try {
    const [response] = await sendGrid.send(msg);
  } catch (e){
    console.error('Send grid error: ', e, e.response.body);
  }
}