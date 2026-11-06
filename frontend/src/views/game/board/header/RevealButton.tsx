import { Eye } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from '../../../../hooks/useMediaQuery';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { IconButton } from 'ui/icon-button';

interface RevealButtonProps {
  onClick: () => void;
}

function RevealButton({ onClick }: RevealButtonProps) {
  const { t } = useTranslation();
  const small = useMediaQuery('(max-width: 500px)');
  const [revealDialogOpen, setRevealDialogOpen] = useState(false);
  const handleOpenDialog = useCallback(() => {
    setRevealDialogOpen(true);
  }, []);
  const handleCloseDialog = useCallback(() => {
    setRevealDialogOpen(false);
  }, []);
  return (
    <>
      {small ? (
        <IconButton
          onClick={handleOpenDialog}
          aria-label={t('RevealCards.buttonLabel')}
          className="text-secondary-700"
        >
          <Eye className="size-5" />
        </IconButton>
      ) : (
        <Button variant="outline" onClick={handleOpenDialog}>
          <Eye className="size-4" />
          {t('RevealCards.buttonLabel')}
        </Button>
      )}
      <Dialog onClose={handleCloseDialog} open={revealDialogOpen}>
        <DialogContent size="sm">
          <DialogTitle>{t('RevealCards.dialogTitle')}</DialogTitle>
          <DialogBody>
            <p className="text-sm leading-6">{t('RevealCards.dialogContent')}</p>
          </DialogBody>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>
              {t('RevealCards.cancelButton')}
            </Button>
            <Button onClick={onClick}>{t('RevealCards.confirmButton')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default RevealButton;
