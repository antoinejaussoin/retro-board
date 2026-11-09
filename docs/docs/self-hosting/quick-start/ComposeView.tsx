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
  useMailjet: boolean;
  useSmtp: boolean;
  mailjetKey: string;
  mailjetSecret: string;
  mailjetSender: string;
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
  useAi: boolean;
  anthropicKey: string;
  anthropicModel: string;
  aiFreeLimit: string;
  aiPaidLimit: string;
  aiFeedbackUrl: string;
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
    useMailjet,
    useSmtp,
    mailjetKey,
    mailjetSecret,
    mailjetSender,
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
    useAi,
    anthropicKey,
    anthropicModel,
    aiFreeLimit,
    aiPaidLimit,
    aiFeedbackUrl,
  },
}: ComposeViewProps) {
  const optionals = [
    p(disableAnon, 'DISABLE_ANONYMOUS_LOGIN', 'true'),
    p(disablePassword, 'DISABLE_PASSWORD_LOGIN', 'true'),
    p(disableRegistration, 'DISABLE_PASSWORD_REGISTRATION', 'true'),
    p(disableAccountDeletion, 'DISABLE_ACCOUNT_DELETION', 'true'),
    p(disableShowAuthor, 'DISABLE_SHOW_AUTHOR', 'true'),
    p(useMailjet, 'MAILJET_API_KEY', mailjetKey),
    p(useMailjet, 'MAILJET_SECRET_KEY', mailjetSecret),
    p(useMailjet, 'MAILJET_SENDER', mailjetSender),
    p(useSmtp && !useMailjet, 'MAIL_SMTP_HOST', smtpHost),
    p(useSmtp && !useMailjet, 'MAIL_PORT', smtpPort, true),
    p(useSmtp && !useMailjet, 'MAIL_SECURE', smtpSecure ? 'true' : 'false'),
    p(useSmtp && !useMailjet, 'MAIL_USER', smtpUser),
    p(useSmtp && !useMailjet, 'MAIL_PASSWORD', smtpPassword),
    p(useSmtp && !useMailjet, 'MAIL_SENDER', smtpSender),
    p(useAi && anthropicKey.length > 0, 'ANTHROPIC_API_KEY', anthropicKey),
    p(useAi && anthropicModel.length > 0, 'ANTHROPIC_MODEL', anthropicModel),
    p(useAi && aiFreeLimit.length > 0, 'AI_FREE_LIMIT', aiFreeLimit, true),
    p(useAi && aiPaidLimit.length > 0, 'AI_PAID_LIMIT', aiPaidLimit, true),
  ].filter(Boolean);

  const frontendOptionals = [
    p(
      useAi && aiFeedbackUrl.length > 0,
      'FRONTEND_AI_FEEDBACK_URL',
      aiFeedbackUrl
    ),
  ].filter(Boolean);

  const text = `services:
  frontend:
    image: retrospected/frontend:latest
    depends_on:
      backend:
        condition: service_healthy
    ports:
      - '${port}:80'
    restart: unless-stopped
    environment:
      FRONTEND_PRIMARY_COLOR: ${d(primaryColours)}
      FRONTEND_SECONDARY_COLOR: ${d(secondaryColours)}
      FRONTEND_HEADER_PRIMARY_COLOR: ${d(primaryHeaderColour)}
      FRONTEND_HEADER_SECONDARY_COLOR: ${d(secondaryHeaderColour)}
      FRONTEND_LOGO: ${d(logo)}${
        frontendOptionals.length ? '\n' + frontendOptionals.join('\n') : ''
      }
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'
    
  backend:
    image: retrospected/backend:latest
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD', 'curl', '-f', 'http://localhost:3201/healthz']
      interval: 5s
      timeout: 5s
      retries: 30
      start_period: 30s
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
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres -d retroboard']
      interval: 5s
      timeout: 5s
      retries: 20
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  pgadmin:
    image: dpage/pgadmin4:latest
    depends_on:
      postgres:
        condition: service_healthy
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
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 20
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
