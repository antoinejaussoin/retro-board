import { colors, Tooltip } from '@material-ui/core';
import { Lock, LockOpen } from '@material-ui/icons';
import React from 'react';
import { SessionMetadata } from '@retrospected/common';
import { CHECK_PREFIX, decrypt } from '../../../crypto/crypto';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import useTranslation from '../../../translations/useTranslations';

interface EncryptedLockProps {
  session: SessionMetadata;
}

function EncryptedLock({ session }: EncryptedLockProps) {
  const [key] = useEncryptionKey(session.id);
  const { Encryption: translations } = useTranslation();

  if (!session.encrypted) {
    return null;
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
      <LockOpen htmlColor={colors.green[500]} />
    </Tooltip>
  );
}

export default EncryptedLock;
