import React from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styles from './ComposeView.module.css';

type ComposeViewProps = {
  dbPassword: string;
  pgPassword: string;
  sessionSecret: string;
  email: string;
  licence: string;
  port: string;
  pgPort: string;
  arm: boolean;
};

export default function ComposeView({
  dbPassword,
  pgPassword,
  email,
  licence,
  sessionSecret,
  port,
  pgPort,
  arm,
}: ComposeViewProps) {
  const text = `version: '3'
services:
  frontend:
    image: retrospected/frontend:latest
    depends_on:
      - backend
    ports:
      - '${port}:80'
    restart: unless-stopped
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
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'
  
  postgres:
    image: postgres:11.6
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
    image: ${!arm ? 'dpage/pgadmin4:4.15' : 'biarms/pgadmin4'}
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
