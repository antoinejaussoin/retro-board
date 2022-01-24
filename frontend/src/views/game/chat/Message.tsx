import { Message } from 'common';
import styled from '@emotion/styled';
import { colors } from '@mui/material';
import { formatRelative } from 'date-fns';
import { useDateLocale } from 'hooks/useFormatDate';
import useCrypto from 'crypto/useCrypto';

type ChatMessageProps = {
  message: Message;
};

export default function ChatMessage({ message }: ChatMessageProps) {
  const locale = useDateLocale();
  const { decrypt } = useCrypto();
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
          <Time>
            {formatRelative(new Date(message.created), new Date(), { locale })}
          </Time>
        </Header>
        <Content>{decrypt(message.content)}</Content>
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
  padding-top: 3px;
  > img {
    width: 30px;
    height: 30px;
    border-radius: 5px;
    object-fit: fill;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: baseline;
  padding-bottom: 4px;
`;

const Name = styled.span`
  font-weight: bold;
  padding-right: 10px;
`;

const Time = styled.span`
  color: ${colors.grey[500]};
  font-size: 0.8rem;
`;

const Content = styled.div`
  margin: 0;
  padding: 0;
  white-space: pre-wrap;
`;
