import { SelfHostedCheckPayload } from '../common';
import config from '../config';
import fetch from 'node-fetch';
import wait, { comparePassword, decrypt } from '../utils';
import { LicenceMetadata } from './../types';

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
  {
    // Parson
    hash: '$2a$10$33O/3uuETs0hKNIRWQzH5uQ8LgvZKhZumDcfy.izLLIzwqXmHRFu2',
    encryptedOwner:
      'U2FsdGVkX1/weIyFN+TJEPkM0YF08D5CSD0vgrDOnouEveyXG2K/TurX63pBrhuR',
  },
  {
    // Retrospected.com
    hash: '$2a$10$hLlxhJ8yDp1lQJtTLePJr.SDuWFHSX4Kat8NHUgqPoKgRGLbZWy26',
    encryptedOwner: 'U2FsdGVkX19b7JIgy/QrMncC1JjoVmBJ5EUo4AcGIkA=',
  },
  {
    // Mindef
    hash: '$2a$10$y3ZX441HpKqjMfemCB285O0.JzuaO5wGBPLtS5vJTQ6T352E9O0bC',
    encryptedOwner:
      'U2FsdGVkX1+xZTCbhmVh4jBPCZfiJ5kipc0Yeo8bm/8CjEoLG8VK/Z1mwTEKxKlR',
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

async function isLicencedBase(): Promise<LicenceMetadata | null> {
  const licenceKey = config.LICENCE_KEY;

  // Checking hardcoded licence as a last resort
  const hardcodedLicence = await checkHardcodedLicence(licenceKey);

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
      if (hardcodedLicence) {
        return hardcodedLicence;
      }
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
    if (hardcodedLicence) {
      return hardcodedLicence;
    }
    console.error(
      'Could not contact the licence server. If you have a valid licence, please contact support@retrospected.com for support.'
    );
    console.log(err);
  }

  if (hardcodedLicence) {
    return hardcodedLicence;
  }

  return null;
}
