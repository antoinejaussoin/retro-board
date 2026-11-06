import { Badge, BadgeCheck, BadgeX } from 'lucide-react';
import type { SessionMetadata } from 'common';
import { useTranslation } from 'react-i18next';
import ProButton from '../../../components/ProButton';
import { Tooltip } from 'ui/tooltip';

interface PrivateSessionIconProps {
  session: SessionMetadata;
}

function PrivateSessionIcon({ session }: PrivateSessionIconProps) {
  const { t } = useTranslation();

  if (!session.locked) {
    return (
      <ProButton>
        <span className="inline-flex items-center">
          <Tooltip content={t('Private.sessionIsPublic')}>
            <span className="inline-flex text-stone-400">
              <Badge className="size-4" />
            </span>
          </Tooltip>
        </span>
      </ProButton>
    );
  }

  if (!session.lockedForUser) {
    return (
      <Tooltip content={t('Private.sessionIsPrivate')}>
        <span className="inline-flex text-emerald-600">
          <BadgeCheck className="size-4" />
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip content={t('Private.sessionIsPrivateNoAccess')}>
      <span className="inline-flex text-red-600">
        <BadgeX className="size-4" />
      </span>
    </Tooltip>
  );
}

export default PrivateSessionIcon;
