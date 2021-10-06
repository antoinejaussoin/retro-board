import React from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { xonokai } from 'react-syntax-highlighter/dist/esm/styles/prism';

type ComposeViewProps = {
  dbPassword: string;
  pgPassword: string;
  sessionSecret: string;
  email: string;
  licence: string;
  port: string;
  pgPort: string;
};

export default function ComposeView({
  dbPassword,
  pgPassword,
  email,
  licence,
  sessionSecret,
  port,
  pgPort,
}: ComposeViewProps) {
  return (
    <SyntaxHighlighter language="yaml" style={xonokai}>
      {`version: '3'
services:
  postgres:
    image: postgres:11.6
    hostname: postgres
    environment:
      # Only change the Database password below BEFORE running for the first time. Once the database
      # is initialised, you can't change the password anymore.
      # This password has to be the same as the DB_PASSWORD in the "backend" section below.
      POSTGRES_PASSWORD: '${dbPassword}'

      # -- Dot not modify --
      POSTGRES_USER: postgres
      POSTGRES_DB: retroboard
    volumes:
      - database:/var/lib/postgresql/data
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  backend:
    image: antoinejaussoin/retro-board-backend:latest
    depends_on:
      - redis
    environment:
      LICENCE_KEY: '${licence}' # Your personal licence key
      SELF_HOSTED_ADMIN: '${email}' # This is the user who is going to be admin on the self-hosted Retrospected instance.
      DB_PASSWORD: '${dbPassword}' # Must be the same as POSTGRES_PASSWORD above
      SESSION_SECRET: '${sessionSecret}' # This can be anything. You don't have to change this.

    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  pgadmin:
    image: dpage/pgadmin4:4.15 # use biarms/pgadmin4 on ARM
    depends_on:
      - postgres
    ports:
      - '${pgPort}:80' # Change ${pgPort} to whatever port you want to access pgAdmin from
    environment:
      PGADMIN_DEFAULT_EMAIL: '${email}' # This will give you access to PGAdmin to manage your database
      PGADMIN_DEFAULT_PASSWORD: '${pgPassword}' # Your default password. Change this if you want, but BEFORE running for the first time.
    volumes:
      - pgadmin:/var/lib/pgadmin
    restart: unless-stopped
    logging:
      driver: 'json-file'
      options:
        max-size: '50m'

  frontend:
    image: antoinejaussoin/retro-board-frontend:latest
    depends_on:
      - backend
    ports:
      - '${port}:80' # Change ${port} to whatever port you want to access Retrospected from
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
`}
    </SyntaxHighlighter>
  );
}
