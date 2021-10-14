import React, { useEffect, useState } from 'react';
import ComposeView from './ComposeView';
import { InputField, Field } from './Field';
import styles from './Editor.module.css';
import randomWords from 'random-words';
import queryString from 'query-string';
import RunDetails from './RunDetails';
import useIsBrowser from '@docusaurus/useIsBrowser';
import Toggle from 'react-toggle';
import usePersistedState from './usePersistedState';

function getRandomPassword() {
  return randomWords(4).join('-');
}

export default function Editor() {
  const isBrowser = useIsBrowser();
  const [dbPassword, setDbPassword] = usePersistedState(
    'db-password',
    getRandomPassword()
  );
  const [pgPassword, setPgPassword] = usePersistedState(
    'pg-password',
    getRandomPassword()
  );
  const [sessionSecret, setSessionSecret] = usePersistedState(
    'session-secret',
    getRandomPassword()
  );
  const [licence, setLicence] = usePersistedState('licence-key', 'demo');
  const [email, setEmail] = usePersistedState('email', 'your@email.com');
  const [port, setPort] = usePersistedState('port', '80');
  const [pgPort, setPgPort] = usePersistedState('pg-port', '81');
  const [isArm, setIsArm] = usePersistedState('is-arm', false);

  useEffect(() => {
    if (isBrowser) {
      const qs = queryString.parse(window.location.search);
      if (qs.email) {
        setEmail(qs.email as string);
      }
      if (qs.licence) {
        setLicence(qs.licence as string);
      }
    }
  }, [isBrowser]);

  return (
    <span>
      <h3>Settings</h3>

      <div className={styles.settings}>
        <InputField
          label="Email"
          description="Your email. It will be used as the admin account for both PGAdmin and Retrospected."
          value={email}
          onChange={setEmail}
        />
        <InputField
          label="Licence Key"
          description="The licence key you received by email after purchase. If you want to try Retrospected, leave the default value"
          value={licence}
          onChange={setLicence}
        />
        <InputField
          label="Retrospected UI Port"
          description="Defines on which port the UI is going to run."
          value={port}
          number
          onChange={setPort}
        />
        <InputField
          label="PGAdmin UI Port"
          description="Defines on which port PGAdmin is going to run."
          value={pgPort}
          number
          onChange={setPgPort}
        />
        <InputField
          label="Database Password"
          description="Postgres database password"
          value={dbPassword}
          onChange={setDbPassword}
        />
        <InputField
          label="Session Secret"
          description="Web server session secret. This can be anything."
          value={sessionSecret}
          onChange={setSessionSecret}
        />
        <InputField
          label="PGAdmin Password"
          description="PGAdmin administrator password, to be used with the email set above."
          value={pgPassword}
          onChange={setPgPassword}
        />
        <Field
          label="Deploying on ARM?"
          description="Only check this if you are deploying on an ARM-based server."
        >
          <div className={styles.toggle}>
            <Toggle
              id="arm-toggle"
              defaultChecked={isArm}
              onChange={(e) => setIsArm(e.target.checked)}
            />
            <label htmlFor="arm-toggle" style={{ marginLeft: 10 }}>
              ARM server
            </label>
          </div>
        </Field>
      </div>
      <h3>Your customised docker-compose file:</h3>

      <ComposeView
        dbPassword={dbPassword}
        pgPassword={pgPassword}
        sessionSecret={sessionSecret}
        licence={licence}
        email={email}
        port={port}
        pgPort={pgPort}
        arm={isArm}
      />
      <h1>2 - Run Docker</h1>
      <ul>
        <li>
          On your machine, create a dedicated directory:{' '}
          <code>mkdir retrospected</code> and <code>cd retrospected</code>.
        </li>
        <li>
          Copy the content of the docker-compose file above into a file named{' '}
          <code>docker-compose.yml</code>, in the directory above
        </li>
        <li>
          Run: <code>docker-compose up -d</code>
        </li>
      </ul>
      <h1>3 - Profit</h1>
      <p>You can now access Retrospected and PGAdmin:</p>
      <RunDetails
        email={email}
        port={port}
        pgPassword={pgPassword}
        pgPort={pgPort}
      />
    </span>
  );
}
