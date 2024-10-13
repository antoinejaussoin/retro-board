import sendGrid, { type MailDataRequired } from '@sendgrid/mail';
import config from '../config.js';
import type { EmailSender } from './types.js';

if (config.SENDGRID_API_KEY) {
  sendGrid.setApiKey(config.SENDGRID_API_KEY);
}

export const sendGridSender: EmailSender = async (
  to: string,
  subject: string,
  body: string,
): Promise<boolean> => {
  const msg: MailDataRequired = {
    to,
    from: {
      email: config.SENDGRID_SENDER,
      name: 'Retrospected',
    },
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
