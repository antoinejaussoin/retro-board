import { encrypt, hashPassword } from './encryption.js';
import { v4 as uuid } from 'uuid';
import chalk from 'chalk-template';

if (!process.argv[2]) {
  console.log(
    chalk`No company name provided. {red Please provide the company name as the first argument}.`,
  );
  process.exit(1);
}

const company = process.argv[2].trim();
const key = process.argv[3] ? process.argv[3].trim() : uuid();

buildHardcodedLicence(key, company);

export async function buildHardcodedLicence(
  licenceKey: string,
  company: string,
): Promise<void> {
  console.log(
    chalk`Building hardcoded licence for company: {yellow ${company}}`,
  );
  console.log(chalk`Licence key to communicate to them: {yellow ${key}}`);
  const hash = await hashPassword(licenceKey);
  const encryptedOwner = encrypt(company, licenceKey);
  const obj = {
    hash,
    encryptedOwner,
  };
  console.log('Copy the following object to the hardcodedLicences array:');
  console.log(chalk`{red ${JSON.stringify(obj, null, 2)}}`);
}
