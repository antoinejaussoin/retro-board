import { Chat, Check, CheckCircle, Create } from '@mui/icons-material';
import {
  AvatarGroup,
  Badge,
  Button,
  colors,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import CustomAvatar from '../../components/Avatar';
import useParticipants from './useParticipants';
import useSession from './useSession';
import styled from '@emotion/styled';
import useUser from '../../auth/useUser';
import useTranslation from '../../translations/useTranslations';
import { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '../../track';
import { Message } from 'common';
import useModal from '../../hooks/useModal';
import ChatModal from './chat/ChatModal';

type GameFooterProps = {
  onReady: () => void;
  messages: Message[];
  onMessage: (content: string) => void;
};

function GameFooter({ onReady, onMessage, messages }: GameFooterProps) {
  const { participants } = useParticipants();
  const { session } = useSession();
  const user = useUser();
  const { PostBoard: translations } = useTranslation();
  const isUserReady = !!user && !!session && session.ready.includes(user.id);
  const fullScreen = useMediaQuery('(min-width:600px)');
  const [chatOpen, openChat, closeChat] = useModal();
  const [readCount, setReadCount] = useState(0);
  const handleReady = useCallback(() => {
    trackEvent('game/session/user-ready');
    onReady();
  }, [onReady]);
  useEffect(() => {
    if (chatOpen) {
      setReadCount(messages.length);
    }
  }, [chatOpen, messages.length]);
  const unreadCount = messages.length - readCount;
  return (
    <Container>
      <AvatarGroup
        max={50}
        sx={{
          flexDirection: 'row',
        }}
      >
        {participants
          .filter((u) => u.online)
          .map((user) => {
            return (
              <Badge
                key={user.id}
                overlap="circular"
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                badgeContent={
                  session?.ready.includes(user.id) ? (
                    <CheckCircle htmlColor={colors.green[500]} />
                  ) : undefined
                }
              >
                <CustomAvatar user={user} key={user.id} title={user.name} />
              </Badge>
            );
          })}
      </AvatarGroup>
      {user && !fullScreen ? (
        <IconButton onClick={handleReady}>
          {isUserReady ? (
            <Create htmlColor={colors.orange[500]} />
          ) : (
            <Check htmlColor={colors.green[500]} />
          )}
        </IconButton>
      ) : null}
      {user && fullScreen ? (
        <Button
          onClick={handleReady}
          variant="outlined"
          endIcon={
            isUserReady ? (
              <Create htmlColor={colors.orange[500]} />
            ) : (
              <Check htmlColor={colors.green[500]} />
            )
          }
        >
          {isUserReady ? translations.iAmNotDoneYet : translations.iAmDone}
        </Button>
      ) : null}
      {user ? (
        <IconButton
          onClick={chatOpen ? closeChat : openChat}
          data-cy="open-chat-button"
        >
          <Badge color="secondary" badgeContent={unreadCount ?? undefined}>
            <Chat htmlColor={colors.orange[500]} />
          </Badge>
        </IconButton>
      ) : null}
      {chatOpen ? (
        <ChatModal messages={messages} onMessage={onMessage} />
      ) : null}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  gap: 10px;
  > div:first-of-type {
    flex: 1;
  }
`;

export default GameFooter;
