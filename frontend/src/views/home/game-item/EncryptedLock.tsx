import { Lock, LockKeyhole, LockOpen } from 'lucide-react';
import type { SessionMetadata } from 'common';
import { useTranslation } from 'react-i18next';
import ProButton from '../../../components/ProButton';
import { CHECK_PREFIX, decrypt } from '../../../crypto/crypto';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import { Tooltip } from 'ui/tooltip';

interface EncryptedLockProps {
  session: SessionMetadata;
}

function EncryptedLock({ session }: EncryptedLockProps) {
  const [key] = useEncryptionKey(session.id);
  const { t } = useTranslation();

  if (!session.encrypted) {
    return (
      <ProButton>
        <span className="inline-flex items-center">
          <Tooltip content={t('Encryption.sessionNotEncrypted')}>
            <span className="inline-flex text-gray-400">
              <LockOpen className="size-4" />
            </span>
          </Tooltip>
        </span>
      </ProButton>
    );
  }

  if (!key) {
    return (
      <Tooltip content={t('Encryption.sessionEncryptedNoKeyTooltip')}>
        <span className="inline-flex text-red-600">
          <Lock className="size-4" />
        </span>
      </Tooltip>
    );
  }

  if (decrypt(session.encrypted, key) !== CHECK_PREFIX) {
    return (
      <Tooltip content={t('Encryption.sessionEncryptedWrongKeyTooltip')}>
        <span className="inline-flex text-red-600">
          <Lock className="size-4" />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t('Encryption.sessionEncryptedHaveKeyTooltip')}>
      <span className="inline-flex text-emerald-600">
        <LockKeyhole className="size-4" />
      </span>
    </Tooltip>
  );
}

export default EncryptedLock;
