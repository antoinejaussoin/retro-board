import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import useBackendCapabilities from '../../global/useBackendCapabilities';
import useOAuthAvailabilities from '../../global/useOAuthAvailabilities';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { cn } from 'ui/cn';
import { Dialog, DialogContent, DialogTitle } from 'ui/dialog';
import LoginContent from './LoginContent';

interface LoginModalProps {
  backdrop?: boolean;
  large?: boolean;
  onClose: () => void;
}

export default function LoginModal({
  onClose,
  backdrop = true,
  large = false,
}: LoginModalProps) {
  const { t } = useTranslation();
  const { any } = useOAuthAvailabilities();
  const { disablePasswords } = useBackendCapabilities();
  const fullScreen = useMediaQuery('(max-width:600px)');
  const wide = large && any && !disablePasswords;

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    }
  }, [onClose]);

  const content = <LoginContent onClose={handleClose} anonymous />;

  if (!backdrop) {
    return (
      <div
        className={cn(
          'text-ink',
          fullScreen
            ? 'min-h-dvh bg-cream'
            : wide
              ? 'mx-auto w-full max-w-5xl px-4 py-8'
              : 'mx-auto w-full max-w-md px-4 py-8',
        )}
      >
        <div className="rounded-3xl border border-line bg-cream shadow-card">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Dialog open onClose={handleClose}>
      <DialogContent size={wide ? 'xl' : 'sm'} fullScreen={fullScreen}>
        <DialogTitle className="sr-only">
          {t('AnonymousLogin.header')}
        </DialogTitle>
        {content}
      </DialogContent>
    </Dialog>
  );
}
