import useSession from '../views/game/useSession';
import { CHECK_PREFIX, decrypt } from './crypto';
import { useEncryptionKey } from './useEncryptionKey';

export default function useCanDecrypt() {
  const { session } = useSession();
  const [key] = useEncryptionKey();

  if (!session || !session.encrypted) {
    return true;
  }

  return decrypt(session.encrypted, key) === CHECK_PREFIX;
}
