import React, { useCallback } from 'react';
import styled from 'styled-components';
import {
  useParams,
  Route,
  useRouteMatch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import AppBar from '@material-ui/core/AppBar';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { Dashboard, List } from '@material-ui/icons';
import useGlobalState from '../state';
import useTranslations from '../translations';
import useGame from './game/useGame';
import GameMode from './game/GameMode';
import SummaryMode from './game/summary/SummaryMode';
import useColumns from './game/useColumns';

interface RouteParams {
  gameId: string;
}

function GamePage() {
  const { GameMenu } = useTranslations();
  const match = useRouteMatch();
  const location = useLocation();
  const history = useHistory();
  const { gameId } = useParams<RouteParams>();
  const { state } = useGlobalState();
  const handleChange = useCallback((_, v) => history.push(v), [history]);
  const columns = useColumns();
  const { session } = state;
  const rootUrl = `${match.url}`;
  const summaryUrl = `${match.url}/summary`;

  const {
    initialised,
    onAddPost,
    onDeletePost,
    onEditPost,
    onLike,
    onRenameSession,
  } = useGame(gameId);

  if (!session || !initialised) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <div>
      <AppBar position="static" color="default">
        <Tabs
          value={location.pathname}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          aria-label="Game mode tabs"
        >
          <Tab label={GameMenu.board} icon={<Dashboard />} value={rootUrl} />
          <Tab label={GameMenu.summary} icon={<List />} value={summaryUrl} />
        </Tabs>
      </AppBar>
      <Route
        path={`${match.url}`}
        exact
        render={() => (
          <GameMode
            columns={columns}
            onEdit={onEditPost}
            onAddPost={onAddPost}
            onDeletePost={onDeletePost}
            onLike={onLike}
            onRenameSession={onRenameSession}
          />
        )}
      />
      <Route
        path={`${match.url}/summary`}
        render={() => <SummaryMode columns={columns} />}
      />
    </div>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 120px;
`;

export default GamePage;
