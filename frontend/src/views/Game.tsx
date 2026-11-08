import { CloudOff, LayoutDashboard, List } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';
import { Button } from 'ui/button';
import { SegmentedControl } from 'ui/segmented';
import { Spinner } from 'ui/spinner';
import NoContent from '../components/NoContent';
import useCrypto from '../crypto/useCrypto';
import AckWarning from './game/AckWarning';
import Board from './game/board/Board';
import SearchBar from './game/SearchBar';
import GameFooter from './game/footer/GameFooter';
import { SummaryMode } from './game/summary/SummaryMode';
import TimerProvider from './game/TimerProvider';
import Unauthorized from './game/Unauthorized';
import useColumns from './game/useColumns';
import useGame from './game/useGame';
import useSession from './game/useSession';
import useUnauthorised from './game/useUnauthorised';

interface RouteParams {
  gameId: string;
}

function GamePage() {
  const { pathname, hash } = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { gameId } = useParams<keyof RouteParams>();
  const { session } = useSession();
  const handleChange = useCallback(
    (next: string) => {
      navigate(next);
    },
    [navigate],
  );
  const columns = useColumns();
  const { decrypt } = useCrypto();
  const [search, setSearch] = useState('');
  const { unauthorised } = useUnauthorised();
  const rootUrl = `/game/${gameId}${hash}`;
  const summaryUrl = `/game/${gameId}/summary${hash}`;

  const path = pathname + hash;

  const {
    status,
    acks,
    onAddPost,
    onChatMessage,
    onMovePost,
    onAddGroup,
    onDeletePost,
    onEditPost,
    onDeletePostGroup,
    onEditPostGroup,
    onLike,
    onCancelVotes,
    onReact,
    onChangeSession,
    onLockSession,
    onUserReady,
    onTimerStart,
    onTimerReset,
    reconnect,
  } = useGame(gameId || '');

  if (status === 'not-connected' || status === 'connecting') {
    return (
      <div className="mt-28 flex flex-col items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (unauthorised) {
    if (unauthorised.type === 'locked') {
      return (
        <NoContent
          title={t('Private.sessionLockedTitle')}
          subtitle={
            t('Private.sessionLockedDescription', {
              moderator: unauthorised.session
                ? unauthorised.session.createdBy.name
                : 'unknown',
              email: unauthorised.session?.createdBy.email
                ? unauthorised.session.createdBy.email
                : 'no email',
            })!
          }
        />
      );
    }
    return <Unauthorized reason={unauthorised.type} />;
  }

  if (!session) {
    return (
      <NoContent
        title="This session does not exist."
        subtitle="Please make sure the URL is correct."
      />
    );
  }

  const modeOptions = [
    {
      value: rootUrl,
      label: (
        <>
          <LayoutDashboard className="size-4" />
          {t('GameMenu.board')}
        </>
      ),
    },
    ...(!session.options.blurCards
      ? [
          {
            value: summaryUrl,
            label: (
              <>
                <List className="size-4" />
                {t('GameMenu.summary')}
              </>
            ),
          },
        ]
      : []),
  ];

  return (
    <TimerProvider>
      <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col">
        <Helmet>
          <title>
            {decrypt(session.name) || t('SessionName.defaultSessionName')} -
            Retrospected
          </title>
          <meta
            property="og:title"
            content={`${
              decrypt(session.name) || t('SessionName.defaultSessionName')
            } - Retrospected`}
          />
          <meta
            property="og:url"
            content={window.location.href.replace(hash, '')}
          />
        </Helmet>
        {status === 'disconnected' ? (
          <div className="fixed inset-x-0 bottom-0 top-14 z-[80] flex flex-col items-center justify-center bg-white/70 px-6 backdrop-blur-sm">
            <h2 className="mb-5 flex items-center gap-2 text-center text-2xl font-light">
              <CloudOff className="size-7" />
              {t('PostBoard.disconnected')}
            </h2>
            <Button variant="secondary" onClick={reconnect}>
              {t('PostBoard.reconnect')}
            </Button>
          </div>
        ) : null}
        <div className="sticky top-14 z-20 flex items-center gap-3 border-b border-line bg-paper px-3 py-2 sm:px-4">
          <SegmentedControl
            aria-label="Game mode tabs"
            value={path}
            onChange={handleChange}
            options={modeOptions}
          />
          <div className="ml-auto min-w-0">
            <SearchBar value={search} onChange={setSearch} />
          </div>
        </div>
        <div className="flex flex-1 flex-col bg-white">
          <AckWarning acks={acks} onRefresh={reconnect} />
          <div className="flex flex-1 flex-col">
          <Routes>
            <Route
              path="/"
              element={
                <Board
                  columns={columns}
                  options={session.options}
                  demo={session.demo}
                  search={search}
                  onEdit={onEditPost}
                  onAddPost={onAddPost}
                  onMovePost={onMovePost}
                  onAddGroup={onAddGroup}
                  onDeletePost={onDeletePost}
                  onLike={onLike}
                  onCancelVotes={onCancelVotes}
                  onReact={onReact}
                  onDeleteGroup={onDeletePostGroup}
                  onEditGroup={onEditPostGroup}
                  onLockSession={onLockSession}
                  onChangeSession={onChangeSession}
                />
              }
            />
            <Route
              path="/summary"
              element={
                !session.options.blurCards ? (
                  <SummaryMode columns={columns} search={search} />
                ) : null
              }
            />
          </Routes>
          </div>
        </div>
        <GameFooter
          onReady={onUserReady}
          messages={session.messages}
          options={session.options}
          onTimerReset={onTimerReset}
          onTimerStart={onTimerStart}
          onMessage={onChatMessage}
          onConfigure={(options) => onChangeSession({ options }, false)}
        />
      </div>
    </TimerProvider>
  );
}

export default GamePage;
