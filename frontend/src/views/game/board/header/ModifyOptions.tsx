import { AllSessionSettings, SessionSettings, User } from 'common';
import { Settings } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { trackEvent } from '../../../../track';
import { Button } from 'ui/button';
import { IconButton } from 'ui/icon-button';
import SessionEditor from '../../../session-editor/SessionEditor';

interface ModifyOptionsProps {
  settings: AllSessionSettings;
  owner: User;
  onChange: (settings: SessionSettings, saveAsTemplate: boolean) => void;
}

function ModifyOptions({ settings, owner, onChange }: ModifyOptionsProps) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const small = useMediaQuery('(max-width: 500px)');

  const handleChange = useCallback(
    (modifiedSettings: AllSessionSettings, saveAsTemplate: boolean) => {
      setOpen(false);
      if (!settings) {
        return;
      }
      trackEvent('game/session/save-options');
      onChange(
        {
          columns: modifiedSettings.columns,
          moderator: modifiedSettings.moderator,
          timer: modifiedSettings.timer,
          options: modifiedSettings.options,
        },
        saveAsTemplate,
      );
    },
    [onChange, settings],
  );

  if (!settings) {
    return null;
  }

  return (
    <>
      {small ? (
        <IconButton
          onClick={() => setOpen(true)}
          aria-label={t('Join.standardTab.customizeButton')}
          className="text-primary-700"
        >
          <Settings className="size-5" />
        </IconButton>
      ) : (
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <Settings className="size-4" />
          {t('Join.standardTab.customizeButton')}
        </Button>
      )}
      {open ? (
        <SessionEditor
          open={open}
          owner={owner}
          settings={settings}
          onClose={() => setOpen(false)}
          onChange={handleChange}
        />
      ) : null}
    </>
  );
}

export default ModifyOptions;
