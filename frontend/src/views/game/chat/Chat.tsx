import { Message } from 'common';
import useCrypto from 'crypto/useCrypto';
import { sortBy } from 'lodash';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ScrollToBottom from 'react-scroll-to-bottom';
import Input from './Input';
import ChatMessage from './Message';

type ChatProps = {
  messages: Message[];
  onMessage: (content: string) => void;
};

export default function Chat({ messages, onMessage }: ChatProps) {
  const { t } = useTranslation();
  const { encrypt } = useCrypto();
  const sortedMessages = useMemo(() => {
    return sortBy(messages, (m) => m.created);
  }, [messages]);
  const handleInput = useCallback(
    (msg: string) => {
      onMessage(encrypt(msg));
    },
    [encrypt, onMessage],
  );
  return (
    <div
      data-cy="chat-container"
      className="flex h-full min-h-0 flex-1 flex-col"
    >
      <ScrollToBottom className="min-h-0 flex-1">
        <div className="flex flex-col gap-2 px-3 py-3">
          {sortedMessages.map((m) => (
            <ChatMessage message={m} key={m.id} />
          ))}
        </div>
      </ScrollToBottom>
      <Input
        placeholder={t('Chat.writeAMessage')!}
        onNewMessage={handleInput}
        cy="chat-input"
      />
    </div>
  );
}
