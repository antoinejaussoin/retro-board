import { SelfHostedCheckPayload } from '@retrospected/common';
import config from '../db/config';
import fetch from 'node-fetch';

export default async function isLicenced() {
  if (
    config.BASE_URL.endsWith('www.retrospected.com') ||
    config.BASE_URL === 'http://localhost:3000'
  ) {
    return true;
  }
  const licenceKey = config.LICENCE_KEY;
  const payload: SelfHostedCheckPayload = { key: licenceKey };
  const response = await fetch('https://www.retrospected.com/api/self-hosted', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (response.ok) {
    const result = await response.text();
    return result === 'true';
  } else {
    console.log('Could not contact the licence server');
    console.log(response.statusText);
    console.log(response.status);
  }
  return false;
}
