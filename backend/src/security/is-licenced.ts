import { SelfHostedCheckPayload } from '@retrospected/common';
import config from '../config';
import fetch from 'node-fetch';

let licenced: boolean | null = null;

export function isSelfHostedAndLicenced() {
  return !!licenced && config.SELF_HOSTED;
}

export async function isLicenced() {
  if (licenced !== null) {
    return licenced;
  }
  const result = await isLicencedBase();
  licenced = result;
  return result;
}

async function isLicencedBase() {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }
  const licenceKey = config.LICENCE_KEY;
  const payload: SelfHostedCheckPayload = { key: licenceKey };
  try {
    const response = await fetch(
      'https://www.retrospected.com/api/self-hosted',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.ok) {
      const result = await response.text();
      return result === 'true';
    } else {
      console.error('Could not contact the licence server');
      console.log(response.status, response.statusText);
    }
  } catch (err) {
    console.error('Could not contact the licence server');
    console.log(err);
  }

  return false;
}
