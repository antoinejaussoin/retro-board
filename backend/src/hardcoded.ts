import { encrypt, hashPassword } from './encryption.js';
import { v4 as uuid } from 'uuid';
import chalk from 'chalk-template';

if (!process.argv[2]) {
  console.log(
    chalk`No company name provided. {red Please provide the company name as the first argument}.`
  );
  process.exit(1);
}

const company = process.argv[2].trim();
const key = process.argv[3] ? process.argv[3].trim() : uuid();

buildHardcodedLicense(key, company);

export async function buildHardcodedLicense(
  licenseKey: string,
  company: string
): Promise<void> {
  console.log(
    chalk`Building hardcoded license for company: {yellow ${company}}`
  );
  console.log(chalk`License key to communicate to them: {yellow ${key}}`);
  const hash = await hashPassword(licenseKey);
  const encryptedOwner = encrypt(company, licenseKey);
  const obj = {
    hash,
    encryptedOwner,
  };
  console.log('Copy the following object to the hardcodedLicenses array:');
  console.log(chalk`{red ${JSON.stringify(obj, null, 2)}}`);
}
