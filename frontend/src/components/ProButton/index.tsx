import useIsDisabled from '../../hooks/useIsDisabled';
import useModal from '../../hooks/useModal';
import { Infinity, Lock, Sparkles, ShieldCheck } from 'lucide-react';
import { cloneElement, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useIsPro from '../../auth/useIsPro';
import { trackEvent } from '../../track';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { startTrial } from '../../views/subscribe/api';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import Feature from './Feature';

interface ComponentProp {
  disabled?: boolean;
  onClick?: () => void;
}

interface ProButtonProps {
  children: React.ReactElement<ComponentProp>;
  /**
   * Will only show the modal if the quota is reached
   */
  quota?: boolean;
}

function ProButton({ children, quota }: ProButtonProps) {
  const isPro = useIsPro();
  const isDisabled = useIsDisabled();
  const isValid = isPro || (quota && !isDisabled);
  const [opened, open, close] = useModal();
  const clone = isValid ? children : cloneElement(children, { onClick: open });
  const navigate = useNavigate();
  const { t } = useTranslation();
  const fullScreen = useMediaQuery('(max-width:600px)');

  const goToSubscribe = useCallback(
    (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/modal/subscribe');
      navigate('/subscribe');
      close();
    },
    [navigate, close],
  );

  const handleStartTrial = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement, globalThis.MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/start');
      await startTrial();
      window.location.reload();
    },
    [],
  );

  const handleClose = useCallback(() => {
    trackEvent('trial/modal/cancel');
    close();
  }, [close]);

  const handleOpen = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      e.stopPropagation();
      e.preventDefault();
      trackEvent('trial/modal/open');
      open();
    },
    [open],
  );

  if (isValid) {
    return <>{clone}</>;
  }

  return (
    <span className="inline-flex cursor-pointer" onClick={handleOpen}>
      {clone}
      <Dialog open={opened} onClose={handleClose}>
        <DialogContent size="sm" fullScreen={fullScreen}>
          <div className="bg-primary-700 px-6 py-8 text-center text-3xl font-light text-white max-[400px]:hidden max-[700px]:text-2xl">
            {t('SubscribeModal.header')}
          </div>
          <DialogTitle>{t('SubscribeModal.title')}</DialogTitle>
          <DialogBody>
            <p className="mb-4 text-sm leading-6 text-muted">
              {t('SubscribeModal.description')}
            </p>
            <div className="flex flex-col gap-3">
              <Feature
                icon={<Lock className="size-6" />}
                color="#c62828"
                title={t('SubscribeModal.features.encryptedSession.title')!}
                description={
                  t('SubscribeModal.features.encryptedSession.description')!
                }
              />
              <Feature
                icon={<ShieldCheck className="size-6" />}
                color="#2e7d32"
                title={t('SubscribeModal.features.privateSessions.title')!}
                description={
                  t('SubscribeModal.features.privateSessions.description')!
                }
              />
              <Feature
                icon={<Infinity className="size-6" />}
                color="#ef6c00"
                title={t('SubscribeModal.features.unlimitedPosts.title')!}
                description={
                  t('SubscribeModal.features.unlimitedPosts.description')!
                }
              />
              <Feature
                icon={<Sparkles className="size-6" />}
                color="#1565c0"
                title={t('SubscribeModal.features.ai.title')!}
                description={t('SubscribeModal.features.ai.description')!}
              />
            </div>
          </DialogBody>
          <DialogFooter className="justify-between">
            <Button variant="secondary" onClick={handleStartTrial}>
              {t('SubscribeModal.startTrial')}
            </Button>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={handleClose}>
                {t('SubscribeModal.cancelButton')}
              </Button>
              <Button onClick={goToSubscribe}>
                {t('SubscribeModal.subscribeButton')}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </span>
  );
}

export default ProButton;
