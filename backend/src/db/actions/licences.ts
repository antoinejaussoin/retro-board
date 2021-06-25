import { transaction } from './transaction';
import LicenceEntity from '../entities/Licence';
import { v4 } from 'uuid';

export async function registerLicence(
  email: string | null,
  customerId: string,
  sessionId: string
): Promise<string | null> {
  return await transaction(async (manager) => {
    const repository = manager.getRepository(LicenceEntity);
    const key = v4();
    const licence = new LicenceEntity(v4(), email, key, customerId, sessionId);
    try {
      const savedLicence = await repository.save(licence);
      if (savedLicence) {
        return `${email}|${savedLicence.key}`;
      }
      return null;
    } catch (err) {
      console.log('Error while saving the licence: ', err);
      return null;
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
      console.log('Error while retriving the licence: ', err);
      return false;
    }
  });
}
