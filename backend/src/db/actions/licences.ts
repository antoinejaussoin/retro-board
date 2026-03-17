import { transaction } from './transaction.js';
import { drizzleTransaction } from '../drizzle-transaction.js';
import LicenceEntity from '../entities/Licence.js';
import { v4 } from 'uuid';
import { sendSelfHostWelcome } from '../../email/emailSender.js';
import { LicenceRepository } from '../repositories/index.js';
import { licencesRepository } from '../repositories/drizzle/index.js';
import * as schema from '../schema/index.js';
import { eq } from 'drizzle-orm';
import type { LicenceMetadata } from './../../types.js';
import { saveAndReload } from '../repositories/BaseRepository.js';

export async function registerLicence(
  email: string | null,
  name: string | null | undefined,
  customerId: string,
  sessionId: string,
): Promise<boolean> {
  return await drizzleTransaction(async (tx) => {
    const key = v4();
    const licenceData = {
      id: v4(),
      email: email,
      key: key,
      stripeCustomerId: customerId,
      stripeSessionId: sessionId,
    };
    try {
      await licencesRepository.insert(licenceData, tx);
      if (email) {
        await sendSelfHostWelcome(email, name || '', key);
      }
      return true;
    } catch (err) {
      console.log('Error while saving the licence: ', err);
      return false;
    }
  });
}

export async function validateLicence(key: string): Promise<boolean> {
  return await drizzleTransaction(async (tx) => {
    try {
      const count = await licencesRepository.count(
        eq(schema.licences.key, key),
        tx,
      );
      return count > 0;
    } catch (err) {
      console.log('Error while retrieving the licence: ', err);
      return false;
    }
  });
}

export async function fetchLicence(
  key: string,
): Promise<LicenceMetadata | null> {
  return await transaction(async (manager) => {
    const repository = manager.getRepository(LicenceEntity);
    try {
      const found = await repository.findOne({
        where: { key },
      });
      if (found) {
        return {
          licence: key,
          owner: found.email as string,
        };
      }
    } catch (err) {
      console.log('Error while retrieving the licence: ', err);
      return null;
    }
    return null;
  });
}
