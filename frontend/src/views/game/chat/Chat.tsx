import { Message } from 'common';
import ScrollToBottom from 'react-scroll-to-bottom';
import styled from '@emotion/styled';
import Input from './Input';
import ChatMessage from './Message';
import { useCallback, useMemo } from 'react';
import { sortBy } from 'lodash';
import useTranslations from 'translations';
import useCrypto from 'crypto/useCrypto';

type ChatProps = {
  messages: Message[];
  onMessage: (content: string) => void;
};

export default function Chat({ messages, onMessage }: ChatProps) {
  const { Chat: translations } = useTranslations();
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
    <Container>
      <ScrollContainer>
        <Messages>
          {sortedMessages.map((m) => (
            <ChatMessage message={m} key={m.id} />
          ))}
        </Messages>
      </ScrollContainer>
      <Input
        placeholder={translations.writeAMessage}
        onNewMessage={handleInput}
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
