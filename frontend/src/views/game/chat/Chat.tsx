import { Message } from 'common';
import ScrollToBottom from 'react-scroll-to-bottom';
import styled from '@emotion/styled';
import Input from './Input';
import ChatMessage from './Message';
import { useCallback, useMemo } from 'react';
import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import useCrypto from 'crypto/useCrypto';

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
    [encrypt, onMessage]
  );
  return (
    <Container data-cy="chat-container">
      <ScrollContainer>
        <Messages>
          {sortedMessages.map((m) => (
            <ChatMessage message={m} key={m.id} />
          ))}
        </Messages>
      </ScrollContainer>
      <Input
        placeholder={t('Chat.writeAMessage')!}
        onNewMessage={handleInput}
        cy="chat-input"
      />
    </Container>
  );
}

const ScrollContainer = styled(ScrollToBottom)`
  height: calc(100vh - 200px);
  flex: 1 1 auto;
`;

const Container = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
`;

const Messages = styled.div`
  flex: 1 1 auto;
  overflow-y: scroll;
  > * {
    margin: 10px;
  }
`;
