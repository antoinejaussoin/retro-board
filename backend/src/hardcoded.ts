import { encrypt, hashPassword } from './utils';

export async function buildHardcodedLicence(
  licenceKey: string,
  company: string
): Promise<void> {
  console.log('Building hardcoded licence for: ', licenceKey);
  const hash = await hashPassword(licenceKey);
  console.log('Hash: ', hash);
  console.log('Encrypted company name: ', encrypt(company, licenceKey));
}
