import { Message } from '@retrospected/common';
import styled from '@emotion/styled';
import Input from './Input';
import ChatMessage from './Message';

type ChatProps = {
  messages: Message[];
  onMessage: (content: string) => void;
};

export default function Chat({ messages, onMessage }: ChatProps) {
  // const [content, setContent] = useState('');
  return (
    <Container>
      {messages.map((m) => (
        <ChatMessage message={m} key={m.id} />
      ))}
      <Input placeholder="Write a message here..." onNewMessage={onMessage} />
    </Container>
  );
}

const Container = styled.div`
  border: 1px solid red;
  min-height: 400px;
  width: 100%;
  > * {
    margin: 10px;
  }
`;
