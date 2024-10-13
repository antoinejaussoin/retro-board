import { useCallback } from 'react';
import { CANT_DECRYPT, decrypt, encrypt } from './crypto';
import { useEncryptionKey } from './useEncryptionKey';

type UseCryptoHook = {
  encrypt: (clear: string | null) => string;
  decrypt: (encrypted: string | null) => string;
};

export default function useCrypto(): UseCryptoHook {
  const [key, storeKey] = useEncryptionKey();

  const encryptCallback = useCallback(
    (clear: string | null) => {
      if (key) {
        storeKey(key);
      }
      return encrypt(clear, key);
    },
    [key, storeKey],
  );

  const decryptCallback = useCallback(
    (encrypted: string | null) => {
      const decrypted = decrypt(encrypted, key);
      if (key && decrypted && decrypted !== CANT_DECRYPT) {
        storeKey(key);
      }
      return decrypted;
    },
    [key, storeKey],
  );

  return { encrypt: encryptCallback, decrypt: decryptCallback };
}
