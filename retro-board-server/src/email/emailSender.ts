import sendGrid from '@sendgrid/mail';
import config from '../db/config';

sendGrid.setApiKey(config.SENDGRID_API_KEY);

export async function send(recipient: string, subject: string, content: string) {
  const msg = {
    to: recipient,
    from: config.SENDGRID_SENDER,
    subject: subject,
    html: content,
  }
  try {
    const [response] = await sendGrid.send(msg);
  } catch (e){
    console.error('Send grid error: ', e);
  }
  
}