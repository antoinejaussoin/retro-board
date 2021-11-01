import { Message } from '@retrospected/common';
import ScrollToBottom from 'react-scroll-to-bottom';
import styled from '@emotion/styled';
import Input from './Input';
import ChatMessage from './Message';
import { useMemo } from 'react';
import { sortBy } from 'lodash';
import { css } from '@mui/styled-engine';

type ChatProps = {
  messages: Message[];
  onMessage: (content: string) => void;
};

export default function Chat({ messages, onMessage }: ChatProps) {
  const sortedMessages = useMemo(() => {
    return sortBy(messages, (m) => m.created);
  }, [messages]);
  return (
    <Container>
      <ScrollContainer>
        <Messages>
          {sortedMessages.map((m) => (
            <ChatMessage message={m} key={m.id} />
          ))}
        </Messages>
      </ScrollContainer>
      <Input placeholder="Write a message here..." onNewMessage={onMessage} />
    </Container>
  );
}

const ScrollContainer = styled(ScrollToBottom)`
  height: calc(100vh - 200px);
  flex: 1 1 auto;
`;

const Container = styled.div`
  // height: calc(100vh - 200px);
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  border: 2px solid green;
`;

const Messages = styled.div`
  flex: 1 1 auto;
  overflow-y: scroll;
  > * {
    margin: 10px;
  }
  border: 2px solid purple;
`;
