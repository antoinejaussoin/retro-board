import hasher from 'crypto-js/sha256';
import config from '../db/config';

export default function isLicenced() {
  const licenceKey = config.LICENCE_KEY;
  const hash = hasher(licenceKey).toString();

  return (
    hash === 'f1fa3e3557d577fccbb2e16aa40e17aaaf1a7931df1dfb8d34cff68898aaed94'
  );
}
