import { Sparkles } from 'lucide-react';
import { requestConfig } from 'api/fetch';
import useUser from 'state/user/useUser';
import type { CoachMessage, CoachRole } from 'common';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMediaQuery } from 'hooks/useMediaQuery';
import config from 'utils/getConfig';
import { v4 } from 'uuid';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from 'ui/dialog';
import { Chat } from './Chat';

type AiCoachProps = {
  open: boolean;
  onClose: () => void;
};

const feedbackUrl = config.AI_FEEDBACK_URL;

export function AiCoach({ open, onClose }: AiCoachProps) {
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [thinking, setThinking] = useState(false);
  const [id] = useState(v4());
  const { t } = useTranslation();
  const user = useUser();
  const fullScreen = useMediaQuery('(max-width:700px)');
  const disabled = !user || user.accountType === 'anonymous';

  const handleMessage = useCallback(
    async (content: string) => {
      setThinking(true);
      const newMessages = [...messages, { role: 'user' as CoachRole, content }];
      setMessages(newMessages);
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          body: JSON.stringify({ id, messages: newMessages }),
          ...requestConfig(),
        });
        if (response.ok) {
          const msgs = (await response.json()) as CoachMessage[] | null;
          setThinking(false);
          if (Array.isArray(msgs)) {
            setMessages(msgs);
          } else {
            setMessages([
              ...newMessages,
              {
                role: 'assistant' as CoachRole,
                content: t('Ai.genericError'),
              },
            ]);
          }
        } else if (response.status === 402) {
          setThinking(false);
          setMessages([
            ...newMessages,
            {
              role: 'assistant' as CoachRole,
              content: user?.pro
                ? t('Ai.paidLimitWarning')
                : t('Ai.freeLimitWarning'),
            },
          ]);
        } else {
          setThinking(false);
          setMessages([
            ...newMessages,
            {
              role: 'assistant' as CoachRole,
              content: t('Ai.genericError'),
            },
          ]);
        }
      } catch (ex) {
        setThinking(false);
        console.error(ex);
      }
    },
    [messages, id, t, user],
  );

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogContent
        size="lg"
        fullScreen={fullScreen}
        className={
          fullScreen
            ? undefined
            : '!inset-y-0 !right-0 !left-auto !h-dvh !max-h-none !w-[min(100%,36rem)] !max-w-none !translate-none !rounded-none !border-y-0 !border-r-0 sm:!rounded-l-3xl'
        }
      >
        <DialogTitle>
          <span className="inline-flex items-center gap-3">
            <Sparkles className="size-5 text-primary-700" />
            {t('Ai.title')}&nbsp;(beta)
          </span>
        </DialogTitle>
        <DialogBody className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
          {!disabled ? <Alert>{t('Ai.info')}</Alert> : null}
          <Chat
            disabled={disabled}
            messages={messages}
            thinking={thinking}
            onClose={onClose}
            onMessage={handleMessage}
          />
        </DialogBody>
        <DialogFooter className="justify-between">
          {feedbackUrl ? (
            <Button variant="outline" asChild>
              <a href={feedbackUrl} target="_blank" rel="noreferrer">
                {t('Ai.feedback')}
              </a>
            </Button>
          ) : (
            <span />
          )}
          <Button variant="ghost" onClick={onClose}>
            {t('Ai.close')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
