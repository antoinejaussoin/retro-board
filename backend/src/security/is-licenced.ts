import { SelfHostedCheckPayload } from '@retrospected/common';
import config from '../config';
import fetch from 'node-fetch';
import wait, { comparePassword, decrypt } from '../utils';
import { LicenceMetadata } from 'src/types';

let licenced: LicenceMetadata | null = null;

type HardcodedLicence = {
  hash: string;
  encryptedOwner: string;
};

const hardcodedLicences: HardcodedLicence[] = [
  {
    hash: '$2a$10$kt4DnxKZEwvoh052JFygru7iLiIrTzSJngcJlaYkWm.tlNzRJx/Di',
    encryptedOwner: 'U2FsdGVkX18/e8sfZ3bpjz3pLQkCxloH8nuniFdU+vo=',
  },
];

export function isSelfHostedAndLicenced() {
  return !!licenced && config.SELF_HOSTED;
}

export async function isLicenced(): Promise<LicenceMetadata | null> {
  if (licenced !== null) {
    return licenced;
  }
  await wait(3000);
  const result = await isLicencedBase();
  licenced = result;
  return result;
}

async function checkHardcodedLicence(
  key: string
): Promise<LicenceMetadata | null> {
  for (const hardcodedLicence of hardcodedLicences) {
    const match = await comparePassword(key, hardcodedLicence.hash);
    if (match) {
      const decrypted = decrypt(hardcodedLicence.encryptedOwner, key);
      return {
        licence: key,
        owner: decrypted,
      };
    }
  }
  return null;
}

// async function buildHardcodedLicence(
//   licenceKey: string,
//   company: string
// ): Promise<void> {
//   console.log('Building hardcoded licence for: ', licenceKey);
//   const hash = await hashPassword(licenceKey);
//   console.log('Hash: ', hash);
//   console.log('Encrypted company name: ', encrypt(company, licenceKey));
// }

async function isLicencedBase(): Promise<LicenceMetadata | null> {
  const licenceKey = config.LICENCE_KEY;

  const payload: SelfHostedCheckPayload = { key: licenceKey };
  try {
    const response = await fetch(
      'https://www.retrospected.com/api/self-hosted-licence',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (response.ok) {
      const result = (await response.json()) as LicenceMetadata;
      return result;
    } else {
      if (response.status === 403) {
        console.error(
          'The licence key is not recognised. If you have a valid licence, please contact support@retrospected.com for support.'
        );
      } else {
        console.error(
          'Could not contact the licence server. If you have a valid licence, please contact support@retrospected.com for support.'
        );
        console.log(response.status, response.statusText);
      }
    }
  } catch (err) {
    console.error(
      'Could not contact the licence server. If you have a valid licence, please contact support@retrospected.com for support.'
    );
    console.log(err);
  }

  // Checking hardcoded licence as a last resort
  const hardcoded = await checkHardcodedLicence(licenceKey);
  if (hardcoded) {
    return hardcoded;
  }

  return null;
}
