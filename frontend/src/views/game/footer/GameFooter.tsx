import { Chat, Check, Create } from '@mui/icons-material';
import {
  Badge,
  Button,
  colors,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import useSession from '../useSession';
import styled from '@emotion/styled';
import useUser from '../../../auth/useUser';
import { useCallback, useEffect, useState } from 'react';
import { trackEvent } from '../../../track';
import { Message, SessionOptions } from 'common';
import useModal from '../../../hooks/useModal';
import ChatModal from '../chat/ChatModal';
import { useTranslation } from 'react-i18next';
import Users from './Users';
import { Timer } from './Timer';
import useCanModifyOptions from '../board/header/useCanModifyOptions';

type GameFooterProps = {
  onReady: () => void;
  messages: Message[];
  options: SessionOptions;
  onMessage: (content: string) => void;
  onTimerStart: () => void;
  onTimerReset: () => void;
  onConfigure: (options: SessionOptions) => void;
};

function GameFooter({
  onReady,
  onMessage,
  messages,
  options,
  onTimerStart,
  onTimerReset,
  onConfigure,
}: GameFooterProps) {
  const { session } = useSession();
  const user = useUser();
  const { t } = useTranslation();
  const isUserReady = !!user && !!session && session.ready.includes(user.id);
  const fullScreen = useMediaQuery('(min-width:600px)');
  const [chatOpen, openChat, closeChat] = useModal();
  const [readCount, setReadCount] = useState(0);
  const canActionTimer = useCanModifyOptions();
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
      <UsersContainer>
        <Users />
      </UsersContainer>
      <TimerContainer>
        <Timer
          canControl={canActionTimer}
          options={options}
          onStart={onTimerStart}
          onStop={onTimerReset}
          onConfigure={onConfigure}
        />
      </TimerContainer>

      <EndControlsContainer>
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
            startIcon={
              isUserReady ? (
                <Create htmlColor={colors.orange[500]} />
              ) : (
                <Check htmlColor={colors.green[500]} />
              )
            }
          >
            {isUserReady
              ? t('PostBoard.iAmNotDoneYet').toString()
              : t('PostBoard.iAmDone').toString()}
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
      </EndControlsContainer>
      {chatOpen ? (
        <ChatModal messages={messages} onMessage={onMessage} />
      ) : null}
    </Container>
  );
}

const Container = styled.div`
  display: grid;
  justify-items: stretch;
  justify-content: stretch;
  align-items: center;
  grid-template-columns: repeat(auto-fit, 1fr);
  grid-template-rows: repeat(auto-fit, 1fr);
  grid-template-areas: 'users timer controls';
  column-gap: 10px;
  row-gap: 10px;
  @media screen and (max-width: 700px) {
    grid-template-areas:
      'timer timer'
      'users controls';
    grid-template-columns: repeat(auto-fit, 1fr);
    grid-template-rows: repeat(auto-fit, 1fr);
  }
`;

const EndControlsContainer = styled.div`
  grid-area: controls;
  display: flex;
  gap: 10px;
  justify-self: flex-end;
`;

const UsersContainer = styled.div`
  grid-area: users;
  padding-left: 10px;
`;

const TimerContainer = styled.div`
  grid-area: timer;
  justify-self: center;
`;

export default GameFooter;
