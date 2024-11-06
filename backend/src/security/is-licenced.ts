import type { SelfHostedCheckPayload } from '../common/index.js';
import config from '../config.js';
import fetch from 'node-fetch';
import wait from '../utils.js';
import type { LicenceMetadata } from './../types.js';
import { comparePassword, decrypt } from '../encryption.js';
import chalkTemplate from 'chalk-template';

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
  {
    // BAM
    hash: '$2a$10$udpIRa0hWeurSsaXtM0iveT4geuQBuGvnNS9UqczkgxOYzHaPqau.',
    encryptedOwner: 'U2FsdGVkX1/DQ2JJ57C+LGM7XBLLg9NDxviOwRwj0pI=',
  },
  {
    // TQG / systemberatung.de
    hash: '$2a$10$R1N5dO2kz78iG3wk6DPs1ODwY9YlHz7uWoIY1TjsasHb1mDOLDSdu',
    encryptedOwner: 'U2FsdGVkX19/vrNOsM2pKKpKOf4ej7UUSfWHwNU9yeY=',
  },
  {
    // Ministère de l'intérieur
    hash: '$2a$10$gRfPyZCnZ6Vj3i7sn9W2YOmTF6QRBq9ha5d.52xpo6vW0htyagnB2',
    encryptedOwner:
      'U2FsdGVkX1+HbvAW4sVZW4V5U22S/FY1uwbp/ks1JJnn2bc/iwbaGYcRrS5UCBer',
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
  key: string,
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

  if (hardcodedLicence) {
    console.log(chalkTemplate`📝  {blue Your licence is {red hardcoded}.}`);
    return hardcodedLicence;
  }

  const payload: SelfHostedCheckPayload = { key: licenceKey };
  try {
    const response = await fetch(
      'https://app.retrospected.com/api/self-hosted-licence',
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );
    if (response.ok) {
      const result = (await response.json()) as LicenceMetadata;
      return result;
    }
    if (hardcodedLicence) {
      return hardcodedLicence;
    }
    if (response.status === 403) {
      console.error(
        'The licence key is not recognised. If you have a valid licence, please contact support@retrospected.com for support.',
      );
    } else {
      console.error(
        'Could not contact the licence server. If you have a valid licence, please contact support@retrospected.com for support.',
      );
      console.log(response.status, response.statusText);
    }
  } catch (err) {
    if (hardcodedLicence) {
      return hardcodedLicence;
    }
    console.error(
      'Could not contact the licence server. If you have a valid licence, please contact support@retrospected.com for support.',
    );
    console.log(err);
  }

  if (hardcodedLicence) {
    return hardcodedLicence;
  }

  return null;
}
