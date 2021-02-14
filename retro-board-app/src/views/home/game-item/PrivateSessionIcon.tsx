import { colors, Tooltip } from '@material-ui/core';
import { VerifiedUser, VerifiedUserOutlined } from '@material-ui/icons';
import { SessionMetadata } from '@retrospected/common';
import useTranslation from '../../../translations/useTranslations';
import ProButton from '../../../components/ProButton';

interface PrivateSessionIconProps {
  session: SessionMetadata;
}

function PrivateSessionIcon({ session }: PrivateSessionIconProps) {
  const { Private: translations } = useTranslation();

  if (!session.locked) {
    return (
      <ProButton>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Tooltip title={translations.sessionIsPublic!}>
            <VerifiedUserOutlined htmlColor={colors.grey[400]} />
          </Tooltip>
        </div>
      </ProButton>
    );
  }

  if (!session.lockedForUser) {
    return (
      <Tooltip title={translations.sessionIsPrivate!}>
        <VerifiedUser htmlColor={colors.green[500]} />
      </Tooltip>
    );
  }
  return (
    <Tooltip title={translations.sessionIsPrivateNoAccess!}>
      <VerifiedUser htmlColor={colors.red[500]} />
    </Tooltip>
  );
}

export default PrivateSessionIcon;
