import { SelfHostedCheckPayload } from '../common/index.js';
import config from '../config.js';
import fetch from 'node-fetch';
import wait from '../utils.js';
import { LicenseMetadata } from './../types.js';
import { comparePassword, decrypt } from '../encryption.js';

let licensed: LicenseMetadata | null = null;

type HardcodedLicense = {
  hash: string;
  encryptedOwner: string;
};

const hardcodedLicenses: HardcodedLicense[] = [
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
  {
    // BAM
    hash: '$2a$10$udpIRa0hWeurSsaXtM0iveT4geuQBuGvnNS9UqczkgxOYzHaPqau.',
    encryptedOwner: 'U2FsdGVkX1/DQ2JJ57C+LGM7XBLLg9NDxviOwRwj0pI=',
  },
];

export function isSelfHostedAndLicenced() {
  return !!licensed && config.SELF_HOSTED;
}

export async function isLicensed(): Promise<LicenseMetadata | null> {
  if (licensed !== null) {
    return licensed;
  }
  await wait(3000);
  const result = await isLicensedBase();
  licensed = result;
  return result;
}

async function checkHardcodedLicense(
  key: string
): Promise<LicenseMetadata | null> {
  for (const hardcodedLicence of hardcodedLicenses) {
    const match = await comparePassword(key, hardcodedLicence.hash);
    if (match) {
      const decrypted = decrypt(hardcodedLicence.encryptedOwner, key);
      return {
        license: key,
        owner: decrypted,
      };
    }
  }
  return null;
}

async function isLicensedBase(): Promise<LicenseMetadata | null> {
  const licenseKey = config.LICENCE_KEY;

  // Checking hardcoded licence as a last resort
  const hardcodedLicense = await checkHardcodedLicense(licenseKey);

  const payload: SelfHostedCheckPayload = { key: licenseKey };
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
      const result = (await response.json()) as LicenseMetadata;
      return result;
    } else {
      if (hardcodedLicense) {
        return hardcodedLicense;
      }
      if (response.status === 403) {
        console.error(
          'The license key is not recognised. If you have a valid license, please contact support@retrospected.com for support.'
        );
      } else {
        console.error(
          'Could not contact the license server. If you have a valid license, please contact support@retrospected.com for support.'
        );
        console.log(response.status, response.statusText);
      }
    }
  } catch (err) {
    if (hardcodedLicense) {
      return hardcodedLicense;
    }
    console.error(
      'Could not contact the license server. If you have a valid license, please contact support@retrospected.com for support.'
    );
    console.log(err);
  }

  if (hardcodedLicense) {
    return hardcodedLicense;
  }

  return null;
}
