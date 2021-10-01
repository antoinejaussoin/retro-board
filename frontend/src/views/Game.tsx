import { useCallback, useState } from 'react';
import styled from '@emotion/styled';
import {
  useParams,
  Route,
  useRouteMatch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import CircularProgress from '@mui/material/CircularProgress';
import AppBar from '@mui/material/AppBar';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Button from '@mui/material/Button';
import { colors } from '@mui/material';
import { Dashboard, List, CloudOff } from '@mui/icons-material';
import useTranslations from '../translations';
import useGame from './game/useGame';
import Board from './game/board/Board';
import SummaryMode from './game/summary/SummaryMode';
import useColumns from './game/useColumns';
import NoContent from '../components/NoContent';
import useCrypto from '../crypto/useCrypto';
import Unauthorized from './game/Unauthorized';
import SearchBar from './game/SearchBar';
import Participants from './game/Participants';
import AckWarning from './game/AckWarning';
import useUnauthorised from './game/useUnauthorised';
import useSession from './game/useSession';

interface RouteParams {
  gameId: string;
}

function GamePage() {
  const { GameMenu, PostBoard } = useTranslations();
  const match = useRouteMatch();
  const { pathname, hash } = useLocation();
  const history = useHistory();
  const translations = useTranslations();
  const { gameId } = useParams<RouteParams>();
  const { session } = useSession();
  const handleChange = useCallback((_, v) => history.push(v), [history]);
  const columns = useColumns();
  const { decrypt } = useCrypto();
  const [search, setSearch] = useState('');
  const { unauthorised, unauthorisedReason } = useUnauthorised();
  const rootUrl = `${match.url}${hash}`;
  const summaryUrl = `${match.url}/summary${hash}`;

  const path = pathname + hash;

  const {
    status,
    acks,
    onAddPost,
    onMovePost,
    onCombinePost,
    onAddGroup,
    onDeletePost,
    onEditPost,
    onDeletePostGroup,
    onEditPostGroup,
    onLike,
    onRenameSession,
    onEditOptions,
    onEditColumns,
    onSaveTemplate,
    onLockSession,
    reconnect,
  } = useGame(gameId);

  if (status === 'not-connected' || status === 'connecting') {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (unauthorised) {
    return <Unauthorized reason={unauthorisedReason} />;
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
    <div>
      <Helmet>
        <title>
          {decrypt(session.name) || translations.SessionName.defaultSessionName}{' '}
          - Retrospected
        </title>
        <meta
          property="og:title"
          content={`${
            decrypt(session.name) || translations.SessionName.defaultSessionName
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
            &nbsp;{PostBoard.disconnected}
          </DisconnectedTitle>
          <Button color="secondary" variant="contained" onClick={reconnect}>
            {PostBoard.reconnect}
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
            <Tab label={GameMenu.board} icon={<Dashboard />} value={rootUrl} />
            {!session.options.blurCards ? (
              <Tab
                label={GameMenu.summary}
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
      <Route
        path={`${match.url}`}
        exact
        render={() => (
          <Board
            columns={columns}
            options={session.options}
            search={search}
            onEdit={onEditPost}
            onAddPost={onAddPost}
            onMovePost={onMovePost}
            onCombinePost={onCombinePost}
            onAddGroup={onAddGroup}
            onDeletePost={onDeletePost}
            onLike={onLike}
            onDeleteGroup={onDeletePostGroup}
            onEditGroup={onEditPostGroup}
            onRenameSession={onRenameSession}
            onEditOptions={onEditOptions}
            onEditColumns={onEditColumns}
            onSaveTemplate={onSaveTemplate}
            onLockSession={onLockSession}
          />
        )}
      />
      {!session.options.blurCards ? (
        <Route
          path={`${match.url}/summary`}
          render={() => <SummaryMode columns={columns} search={search} />}
        />
      ) : null}
      <ParticipantContainer>
        <Participants />
      </ParticipantContainer>
    </div>
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
