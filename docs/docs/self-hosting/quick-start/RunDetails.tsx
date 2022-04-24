import Link from '@docusaurus/Link';
import React from 'react';
import Admonition from './Admonition';

type RunDetailsProps = {
  port: string;
  email: string;
  pgPassword: string;
  pgPort: string;
};

export default function RunDetails({
  port,
  email,
  pgPassword,
  pgPort,
}: RunDetailsProps) {
  return (
    <>
      <ul>
        <li>
          Retrospected:{' '}
          <a href={`http://localhost${port === '80' ? '' : `:${port}`}`}>
            http://localhost{port === '80' ? '' : `:${port}`}
          </a>
          .
        </li>
        <li>
          PGAdmin:{' '}
          <a href={`http://localhost:${pgPort}`}>http://localhost:{pgPort}</a>
          <br />
          Username: <b>{email}</b>
          <br />
          Password: <b>{pgPassword}</b>
          <br />
          Then <Link to="/docs/self-hosting/pgadmin">follow this guide</Link> to
          add your database.
        </li>
      </ul>
      <Admonition type="info" title="Don't forget to create your admin account">
        By default, no account is created on Retrospected. Don't forget to
        create an account (a "Password Account") with email <b>{email}</b> to
        claim the admin account.
      </Admonition>
    </>
  );
}
