import nodemailer from 'nodemailer';
import config from '../config';
import { EmailSender } from './types';

const transporter = nodemailer.createTransport({
  host: config.MAIL_SMTP_HOST,
  port: config.MAIL_PORT,
  secure: config.MAIL_SECURE,
  tls: config.MAIL_ALLOW_SELF_SIGNED_CERTS
    ? {
        rejectUnauthorized: false,
      }
    : undefined,
  auth: {
    user: config.MAIL_USER,
    pass: config.MAIL_PASSWORD,
  },
});

export const smtpSender: EmailSender = async function (
  to: string,
  subject: string,
  body: string
): Promise<boolean> {
  try {
    const response = await transporter.sendMail({
      from: config.MAIL_SENDER,
      to,
      subject,
      html: body,
    });
    return !!response.accepted;
  } catch (e) {
    console.error('SMTP error', e);
    return false;
  }
};
