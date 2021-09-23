import { colors } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import { Lock, LockOpenOutlined, LockOutlined } from '@mui/icons-material';
import { SessionMetadata } from '@retrospected/common';
import { CHECK_PREFIX, decrypt } from '../../../crypto/crypto';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import useTranslation from '../../../translations/useTranslations';
import ProButton from '../../../components/ProButton';

interface EncryptedLockProps {
  session: SessionMetadata;
}

function EncryptedLock({ session }: EncryptedLockProps) {
  const [key] = useEncryptionKey(session.id);
  const { Encryption: translations } = useTranslation();

  if (!session.encrypted) {
    return (
      <ProButton>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={translations.sessionNotEncrypted!}>
            <LockOpenOutlined htmlColor={colors.grey[400]} />
          </Tooltip>
        </div>
      </ProButton>
    );
  }

  if (!key) {
    return (
      <Tooltip title={translations.sessionEncryptedNoKeyTooltip!}>
        <Lock color="error" />
      </Tooltip>
    );
  }

  if (decrypt(session.encrypted, key) !== CHECK_PREFIX) {
    return (
      <Tooltip title={translations.sessionEncryptedWrongKeyTooltip!}>
        <Lock color="error" />
      </Tooltip>
    );
  }

  return (
    <Tooltip title={translations.sessionEncryptedHaveKeyTooltip!}>
      <LockOutlined htmlColor={colors.green[500]} />
    </Tooltip>
  );
}

export default EncryptedLock;
