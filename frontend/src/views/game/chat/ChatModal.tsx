import { Message } from 'common';
import styled from '@emotion/styled';
import Chat from './Chat';
import { colors } from '@mui/material';

type ChatModalProps = {
  messages: Message[];
  onMessage: (content: string) => void;
};

export default function ChatModal({ messages, onMessage }: ChatModalProps) {
  return (
    <Container>
      <Chat messages={messages} onMessage={onMessage} />
    </Container>
  );
}

const Container = styled.div`
  position: fixed;
  bottom: 80px;
  right: 15px;
  background-color: white;
  box-shadow: 2px 2px 5px 2px rgba(224, 224, 224, 1);
  border: 1px solid ${colors.grey[200]};
  border-radius: 5px;
  max-width: 400px;
  display: flex;
  flex-flow: column;

  @media (max-width: 800px) {
    max-width: unset;
    width: calc(100% - 30px);
    left: 15px;
  }
`;
