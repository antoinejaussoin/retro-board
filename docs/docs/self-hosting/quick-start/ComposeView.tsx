import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ComposeView.module.css';

type ComposeViewSettings = {
  dbPassword: string;
  pgPassword: string;
  sessionSecret: string;
  email: string;
  licence: string;
  port: string;
  pgPort: string;
  disableAnon: boolean;
  disablePassword: boolean;
  disableRegistration: boolean;
  disableAccountDeletion: boolean;
  disableShowAuthor: boolean;
  useSendgrid: boolean;
  useSmtp: boolean;
  sendgridKey: string;
  sendgridSender: string;
  smtpHost: string;
  smtpPort: string;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  smtpSender: string;
  primaryColours: string;
  secondaryColours: string;
  primaryHeaderColour: string;
  secondaryHeaderColour: string;
  logo: string;
};

type ComposeViewProps = {
  settings: ComposeViewSettings;
};

function p(condition: boolean, key: string, value: string, number = false) {
  return condition
    ? `      ${key}: ${number ? value : "'" + value + "'"}`
    : null;
}

function d(value: string) {
  return value ? `'${value}'` : '# Not provided. Using defaults.';
}

export default function ComposeView({
  settings: {
    dbPassword,
    pgPassword,
    email,
    licence,
    sessionSecret,
    port,
    pgPort,
    disableAnon,
    disablePassword,
    disableRegistration,
    disableAccountDeletion,
    disableShowAuthor,
    useSendgrid,
    useSmtp,
    sendgridKey,
    sendgridSender,
    smtpHost,
    smtpPort,
    smtpSecure,
    smtpUser,
    smtpPassword,
    smtpSender,
    primaryColours,
    secondaryColours,
    primaryHeaderColour,
    secondaryHeaderColour,
    logo,
  },
}: ComposeViewProps) {
  const optionals = [
    p(disableAnon, 'DISABLE_ANONYMOUS_LOGIN', 'true'),
    p(disablePassword, 'DISABLE_PASSWORD_LOGIN', 'true'),
    p(disableRegistration, 'DISABLE_PASSWORD_REGISTRATION', 'true'),
    p(disableAccountDeletion, 'DISABLE_ACCOUNT_DELETION', 'true'),
    p(disableShowAuthor, 'DISABLE_SHOW_AUTHOR', 'true'),
    p(useSendgrid, 'SENDGRID_API_KEY', sendgridKey),
    p(useSendgrid, 'SENDGRID_SENDER', sendgridSender),
    p(useSmtp, 'MAIL_SMTP_HOST', smtpHost),
    p(useSmtp, 'MAIL_PORT', smtpPort, true),
    p(useSmtp, 'MAIL_SECURE', smtpSecure ? 'true' : 'false'),
    p(useSmtp, 'MAIL_USER', smtpUser),
    p(useSmtp, 'MAIL_PASSWORD', smtpPassword),
    p(useSmtp, 'MAIL_SENDER', smtpSender),
  ].filter(Boolean);

  const text = `version: '3'
services:
  frontend:
    image: retrospected/frontend:latest
    depends_on:
      - backend
    ports:
      - '${port}:80'
    restart: unless-stopped
    environment:
      FRONTEND_PRIMARY_COLOURS: ${d(primaryColours)}
      FRONTEND_SECONDARY_COLOURS: ${d(secondaryColours)}
      FRONTEND_PRIMARY_HEADER_COLOUR: ${d(primaryHeaderColour)}
      FRONTEND_SECONDARY_HEADER_COLOUR: ${d(secondaryHeaderColour)}
      FRONTEND_LOGO: ${d(logo)}
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'
    
  backend:
    image: retrospected/backend:latest
    depends_on:
      - redis
    environment:
      LICENCE_KEY: '${licence}'
      SELF_HOSTED_ADMIN: '${email}'
      DB_PASSWORD: '${dbPassword}'
      SESSION_SECRET: '${sessionSecret}'
${optionals.join('\n')}

    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'
  
  postgres:
    image: postgres:16
    hostname: postgres
    environment:
      POSTGRES_PASSWORD: '${dbPassword}'
      POSTGRES_USER: postgres
      POSTGRES_DB: retroboard
    volumes:
      - database:/var/lib/postgresql/data
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  pgadmin:
    image: dpage/pgadmin4:latest
    depends_on:
      - postgres
    ports:
      - '${pgPort}:80'
    environment:
      PGADMIN_DEFAULT_EMAIL: '${email}'
      PGADMIN_DEFAULT_PASSWORD: '${pgPassword}'
    volumes:
      - pgadmin:/var/lib/pgadmin
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  redis:
    image: redis:latest
    depends_on:
      - postgres
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

volumes:
  database:
  pgadmin:
`;
  return (
    <>
      <CopyToClipboard text={text}>
        <button className={styles.download} style={{ marginBottom: 10 }}>
          Copy to clipboard
        </button>
      </CopyToClipboard>

      <SyntaxHighlighter language="yaml" style={xonokai}>
        {text}
      </SyntaxHighlighter>
    </>
  );
}
