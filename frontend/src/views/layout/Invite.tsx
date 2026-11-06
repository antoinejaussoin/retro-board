import { Copy, UserPlus } from 'lucide-react';
import { useCallback, useState } from 'react';
import Clipboard from 'react-copy-to-clipboard';
import { useTranslation } from 'react-i18next';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { IconButton } from 'ui/icon-button';

export default function Invite() {
  const [isOpen, open] = useState(false);
  const toggle = useCallback(() => open(!isOpen), [open, isOpen]);
  const { t } = useTranslation();
  const url = window.location.href;
  return (
    <>
      <IconButton onClick={toggle} aria-label={t('Invite.dialog.title') ?? 'Invite'} className="hover:bg-white/15">
        <UserPlus className="size-5" />
      </IconButton>
      <Dialog open={isOpen} onClose={toggle}>
        <DialogContent size="sm">
          <DialogTitle>{t('Invite.dialog.title')}</DialogTitle>
          <DialogBody>
            <p className="text-sm text-muted">{t('Invite.dialog.text')}:</p>
            <p className="my-3 break-all text-sm text-secondary-700">{url}</p>
            <Clipboard text={url}>
              <Button variant="ghost">
                <Copy className="size-4" />
                {t('Invite.dialog.copyButton')}
              </Button>
            </Clipboard>
          </DialogBody>
          <DialogFooter>
            <Button onClick={toggle}>{t('Generic.ok')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
