import useBackendCapabilities from 'global/useBackendCapabilities';
import useModal from 'hooks/useModal';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'hooks/useMediaQuery';
import { Button } from 'ui/button';
import { IconButton } from 'ui/icon-button';
import { AiCoach } from './AiCoach';

export function AiButton() {
  const [opened, open, close] = useModal();
  const { t } = useTranslation();
  const small = useMediaQuery('(max-width:800px)');
  const { ai } = useBackendCapabilities();
  if (!ai) {
    return null;
  }
  return (
    <>
      {small ? (
        <IconButton onClick={open} disabled={!ai} aria-label={t('Ai.title') ?? 'AI'} className="hover:bg-white/15">
          <Sparkles className="size-5" />
        </IconButton>
      ) : (
        <Button onClick={open} disabled={!ai} variant="secondary" className="mr-2">
          <Sparkles className="size-4" />
          {t('Ai.title')}
        </Button>
      )}
      <AiCoach onClose={close} open={opened} />
    </>
  );
}
