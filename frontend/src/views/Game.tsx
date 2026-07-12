import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import {
  useParams,
  Route,
  useLocation,
  useNavigate,
  Routes,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import { colors } from '@mui/material';
import { Dashboard, List, CloudOff } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import useGame from './game/useGame';
import Board from './game/board/Board';
import { SummaryMode } from './game/summary/SummaryMode';
import useColumns from './game/useColumns';
import NoContent from '../components/NoContent';
import useCrypto from '../crypto/useCrypto';
import Unauthorized from './game/Unauthorized';
import SearchBar from './game/SearchBar';
import GameFooter from './game/footer/GameFooter';
import AckWarning from './game/AckWarning';
import useUnauthorised from './game/useUnauthorised';
import useSession from './game/useSession';
import TimerProvider from './game/TimerProvider';

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
    (_: unknown, v: string) => navigate(v),
    [navigate]
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
    onCombinePost,
    onAddGroup,
    onDeletePost,
    onEditPost,
    onDeletePostGroup,
    onEditPostGroup,
    onLike,
    onCancelVotes,
    onChangeSession,
    onLockSession,
    onUserReady,
    onTimerStart,
    onTimerReset,
    reconnect,
  } = useGame(gameId || '');

  if (status === 'not-connected' || status === 'connecting') {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
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

  return (
    <TimerProvider>
      <div>
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
          <DisconnectedContainer>
            <DisconnectedTitle>
              <CloudOff
                style={{ position: 'relative', top: 3, marginRight: 10 }}
              />
              &nbsp;{t('PostBoard.disconnected')}
            </DisconnectedTitle>
            <Button color="secondary" variant="contained" onClick={reconnect}>
              {t('PostBoard.reconnect')}
            </Button>
          </DisconnectedContainer>
        ) : null}
        <AppBar position="static" color="default">
          <AppBarContent>
            <Tabs
              value={path}
              onChange={handleChange}
              variant="scrollable"
              scrollButtons
              indicatorColor="primary"
              textColor="primary"
              aria-label="Game mode tabs"
              allowScrollButtonsMobile
            >
              <Tab
                label={t('GameMenu.board')}
                icon={<Dashboard />}
                value={rootUrl}
              />
              {!session.options.blurCards ? (
                <Tab
                  label={t('GameMenu.summary')}
                  icon={<List />}
                  value={summaryUrl}
                />
              ) : null}
            </Tabs>
            <SearchContent>
              <SearchBar value={search} onChange={setSearch} />
            </SearchContent>
          </AppBarContent>
        </AppBar>
        <AckWarning acks={acks} onRefresh={reconnect} />
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
                onCombinePost={onCombinePost}
                onAddGroup={onAddGroup}
                onDeletePost={onDeletePost}
                onLike={onLike}
                onCancelVotes={onCancelVotes}
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
        <ParticipantContainer>
          <GameFooter
            onReady={onUserReady}
            messages={session.messages}
            options={session.options}
            onTimerReset={onTimerReset}
            onTimerStart={onTimerStart}
            onMessage={onChatMessage}
            onConfigure={(options) => onChangeSession({ options }, false)}
          />
        </ParticipantContainer>
      </div>
    </TimerProvider>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 120px;
`;

const DisconnectedContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: fixed;
  height: 100%;
  height: calc(100% - 56px);
  width: 100%;
  z-index: 999;
  background-color: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(3px);
`;

const DisconnectedTitle = styled.h2`
  font-weight: 300;
  text-align: center;
  margin: 0 20px 20px;
`;

const AppBarContent = styled.div`
  display: flex;
`;

const SearchContent = styled.div`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  flex: 1;
  margin-right: 20px;
`;

const ParticipantContainer = styled.div`
  position: fixed;
  bottom: 0px;
  right: 0px;
  left: 0px;
  padding: 10px;
  z-index: 3;
  border-top: 1px solid ${colors.grey[300]};
  background-color: white;
`;

export default GamePage;
