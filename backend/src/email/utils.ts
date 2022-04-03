import config from '../config';

export function canSendEmails() {
  return !!config.MAIL_SMTP_HOST || !!config.SENDGRID_API_KEY;
}
