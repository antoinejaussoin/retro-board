export type EmailSender = (
  to: string,
  subject: string,
  body: string
) => Promise<boolean>;
