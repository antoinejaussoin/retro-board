import config from '../config.js';

export function canSendEmails() {
  return !!config.MAIL_SMTP_HOST || !!config.SENDGRID_API_KEY;
}
