import { SessionOptions } from 'common';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import TimerSection from 'views/session-editor/sections/timer/TimerSection';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';

type TimerSettingsModalProps = {
  options: SessionOptions;
  open: boolean;
  onClose: () => void;
  onChange: (options: SessionOptions) => void;
};

export function TimerSettingsModal({
  open,
  options,
  onChange,
  onClose,
}: TimerSettingsModalProps) {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [settings, setSettings] = useState(options);
  const { t } = useTranslation();
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent fullScreen={fullScreen} size="lg">
        <DialogTitle className="sr-only">
          {t('Customize.timerCategory')}
        </DialogTitle>
        <DialogBody>
          <TimerSection options={settings} onChange={setSettings} />
        </DialogBody>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            {t('Generic.cancel')}
          </Button>
          <Button
            onClick={() => {
              onChange(settings);
            }}
          >
            {t('Generic.ok')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
