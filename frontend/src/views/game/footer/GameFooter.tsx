import { Message, SessionOptions } from 'common';
import { Check, MessageCircle, Pencil } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useModal from '../../../hooks/useModal';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import useUser from '../../../state/user/useUser';
import { trackEvent } from '../../../track';
import { Button } from 'ui/button';
import { cn } from 'ui/cn';
import { IconButton } from 'ui/icon-button';
import useCanModifyOptions from '../board/header/useCanModifyOptions';
import ChatModal from '../chat/ChatModal';
import useSession from '../useSession';
import { Timer } from './Timer';
import Users from './Users';

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
  const wide = useMediaQuery('(min-width:600px)');
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
  const readyIcon = isUserReady ? (
    <Pencil className="size-4 text-orange-500" />
  ) : (
    <Check className="size-4 text-emerald-500" />
  );
  return (
    <footer
      className={cn(
        'fixed z-20 border-line bg-cream',
        wide
          ? 'bottom-4 left-1/2 flex max-w-[calc(100%-2rem)] -translate-x-1/2 items-center gap-3 rounded-full border px-3 py-1.5 shadow-lg'
          : 'inset-x-0 bottom-0 border-t px-2 py-2',
      )}
    >
      <div
        className={cn(
          wide
            ? 'flex min-w-0 items-center gap-3'
            : 'grid w-full items-center gap-2',
        )}
        style={
          wide
            ? undefined
            : {
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gridTemplateAreas: '"timer timer" "users controls"',
              }
        }
      >
        <div
          className={cn('min-w-0 overflow-x-auto', wide && 'max-w-[40vw]')}
          style={wide ? undefined : { gridArea: 'users' }}
        >
          <Users />
        </div>
        <div
          className={cn(!wide && 'flex justify-center')}
          style={wide ? undefined : { gridArea: 'timer' }}
        >
          <Timer
            canControl={canActionTimer}
            options={options}
            onStart={onTimerStart}
            onStop={onTimerReset}
            onConfigure={onConfigure}
          />
        </div>
        <div
          className={cn(
            'flex items-center gap-1',
            !wide && 'justify-self-end',
          )}
          style={wide ? undefined : { gridArea: 'controls' }}
        >
          {user && !wide ? (
            <IconButton
              onClick={handleReady}
              aria-label={
                isUserReady
                  ? t('PostBoard.iAmNotDoneYet')
                  : t('PostBoard.iAmDone')
              }
            >
              {readyIcon}
            </IconButton>
          ) : null}
          {user && wide ? (
            <Button variant="outline" size="sm" onClick={handleReady}>
              {readyIcon}
              {isUserReady
                ? t('PostBoard.iAmNotDoneYet').toString()
                : t('PostBoard.iAmDone').toString()}
            </Button>
          ) : null}
          {user ? (
            <IconButton
              onClick={chatOpen ? closeChat : openChat}
              data-cy="open-chat-button"
              aria-label="Chat"
              className="relative"
            >
              <MessageCircle className="size-5 text-orange-500" />
              {unreadCount > 0 ? (
                <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-secondary-600 px-1 text-[10px] font-medium text-white">
                  {unreadCount}
                </span>
              ) : null}
            </IconButton>
          ) : null}
        </div>
      </div>
      {chatOpen ? (
        <ChatModal
          messages={messages}
          onMessage={onMessage}
          onClose={closeChat}
        />
      ) : null}
    </footer>
  );
}

export default GameFooter;
