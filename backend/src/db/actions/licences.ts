import { transaction } from './transaction.js';
import LicenceEntity from '../entities/Licence.js';
import { v4 } from 'uuid';
import { sendSelfHostWelcome } from '../../email/emailSender.js';
import { LicenceRepository } from '../repositories/index.js';
import type { LicenceMetadata } from './../../types.js';
import { saveAndReload } from '../repositories/BaseRepository.js';

export async function registerLicence(
  email: string | null,
  name: string | null | undefined,
  customerId: string,
  sessionId: string,
): Promise<boolean> {
  return await transaction(async (manager) => {
    const repository = manager.withRepository(LicenceRepository);
    const key = v4();
    const licence = new LicenceEntity(v4(), email, key, customerId, sessionId);
    try {
      const savedLicence = await saveAndReload(repository, licence);
      if (savedLicence) {
        if (email) {
          await sendSelfHostWelcome(email, name || '', key);
        }
        return true;
      }
      return false;
    } catch (err) {
      console.log('Error while saving the licence: ', err);
      return false;
    }
  });
}

export async function validateLicence(key: string): Promise<boolean> {
  return await transaction(async (manager) => {
    const repository = manager.getRepository(LicenceEntity);
    try {
      const found = await repository.count({
        where: { key },
      });
      return found > 0;
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
