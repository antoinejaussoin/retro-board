import sendGrid, { MailDataRequired } from '@sendgrid/mail';
import config from '../config';
import { EmailSender } from './types';

if (config.SENDGRID_API_KEY) {
  sendGrid.setApiKey(config.SENDGRID_API_KEY);
}

export const sendGridSender: EmailSender = async function (
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  const msg: MailDataRequired = {
    to,
    from: config.SENDGRID_SENDER,
    html: body,
    subject,
    trackingSettings: {
      subscriptionTracking: {
        enable: true,
        substitutionTag: '[Unsubscribe]',
      },
    },
  };
  try {
    await sendGrid.send(msg);
  } catch (e) {
    console.error('Error while using sendgrid: ', e);
    return false;
  }

  return true;
};
