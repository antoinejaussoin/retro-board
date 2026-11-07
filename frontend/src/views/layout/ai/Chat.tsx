import ScrollToBottom from 'react-scroll-to-bottom';
import type { CoachMessage } from 'common';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Alert } from 'ui/alert';
import { Button } from 'ui/button';
import { Examples } from './Examples';
import ChatInput from './ChatInput';
import ChatMessage from './ChatMessage';

type ChatProps = {
  messages: CoachMessage[];
  thinking: boolean;
  disabled: boolean;
  onMessage: (content: string) => void;
  onClose: () => void;
};

export function Chat({
  messages,
  disabled,
  thinking,
  onClose,
  onMessage,
}: ChatProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="relative min-h-0 flex-1">
        <ScrollToBottom
          className="!absolute inset-0"
          scrollViewClassName="h-full overflow-y-auto"
          followButtonClassName="!bg-paper !text-ink after:text-xs after:content-['↓']"
        >
          {messages.map((message, index) => (
            <ChatMessage
              message={message.content ?? ''}
              own={message.role === 'user'}
              // Coach replies have no id; order is append-only.
              key={`${message.role}-${index}`}
            />
          ))}
          {thinking ? <ChatMessage message={<Thinking />} /> : null}
          {disabled ? (
            <div className="flex h-full flex-col items-center justify-center gap-6 px-4 text-center">
              <Alert severity="error">{t('Ai.disabledAnonymous')}</Alert>
              <Button
                onClick={() => {
                  navigate('/account');
                  onClose();
                }}
              >
                {t('AccountPage.convertTitle')}
              </Button>
            </div>
          ) : null}
          {!disabled && messages.length === 0 ? (
            <div className="pt-8">
              <Examples onSelect={onMessage} />
            </div>
          ) : null}
        </ScrollToBottom>
      </div>
      <div className="mt-4">
        <ChatInput disabled={disabled || thinking} onMessage={onMessage} />
      </div>
    </div>
  );
}

function Thinking() {
  return (
    <span className="inline-flex items-end gap-1 py-1" aria-hidden>
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:150ms]" />
      <span className="size-1.5 animate-bounce rounded-full bg-current [animation-delay:300ms]" />
    </span>
  );
}
