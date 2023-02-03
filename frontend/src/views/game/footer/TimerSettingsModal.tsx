import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  useMediaQuery,
} from '@mui/material';
import { SessionOptions } from 'common';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import TimerSection from 'views/session-editor/sections/timer/TimerSection';

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
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      fullScreen={fullScreen}
      keepMounted={false}
    >
      <DialogContent>
        <TimerSection options={settings} onChange={setSettings} />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="text">
          {t('Generic.cancel')}
        </Button>
        <Button
          onClick={() => {
            onChange(settings);
          }}
          color="primary"
          variant="contained"
        >
          {t('Generic.ok')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
