import { Message } from 'common';
import styled from '@emotion/styled';
import { colors } from '@mui/material';
import { formatRelative } from 'date-fns';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  return (
    <Container>
      <Photo>
        {message.user.photo ? (
          <img src={message.user.photo} alt={message.user.name} />
        ) : null}
      </Photo>
      <Inner>
        <Header>
          <Name>{message.user.name}</Name>
          <Time>{formatRelative(new Date(message.created), new Date())}</Time>
        </Header>
        <Content>{message.content}</Content>
      </Inner>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

const Inner = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: 10px;
`;

const Photo = styled.div`
  width: 30px;
  > img {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    object-fit: fill;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
`;

const Name = styled.span`
  font-weight: bold;
  padding-right: 10px;
`;

const Time = styled.span`
  color: ${colors.grey[500]};
`;

const Content = styled.div`
  margin: 0;
  padding: 0;
  white-space: pre;
`;
