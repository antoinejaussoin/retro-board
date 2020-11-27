import React, { useCallback } from 'react';
import styled from 'styled-components';
import {
  useParams,
  Route,
  useRouteMatch,
  useLocation,
  useHistory,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { CircularProgress, AppBar, Tabs, Tab, Button } from '@material-ui/core';
import { Dashboard, List, CloudOff } from '@material-ui/icons';
import useGlobalState from '../state';
import useTranslations from '../translations';
import useGame from './game/useGame';
import Board from './game/board/Board';
import SummaryMode from './game/summary/SummaryMode';
import useColumns from './game/useColumns';
import NoContent from '../components/NoContent';
import useCrypto from '../crypto/useCrypto';
import Unauthorized from './game/Unauthorized';

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
  const { state } = useGlobalState();
  const handleChange = useCallback((_, v) => history.push(v), [history]);
  const columns = useColumns();
  const { decrypt } = useCrypto();
  const { session, unauthorized, unauthorized_reason } = state;
  const rootUrl = `${match.url}${hash}`;
  const summaryUrl = `${match.url}/summary${hash}`;

  const path = pathname + hash;

  const {
    initialised,
    disconnected,
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

  if (!disconnected && (!session || !initialised)) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  if (unauthorized) {
    return <Unauthorized reason={unauthorized_reason} />;
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
      {disconnected ? (
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
        <Tabs
          value={path}
          onChange={handleChange}
          variant="scrollable"
          scrollButtons="on"
          indicatorColor="primary"
          textColor="primary"
          aria-label="Game mode tabs"
        >
          <Tab label={GameMenu.board} icon={<Dashboard />} value={rootUrl} />
          {!session.options.blurCards ? (
            <Tab label={GameMenu.summary} icon={<List />} value={summaryUrl} />
          ) : null}
        </Tabs>
      </AppBar>
      <Route
        path={`${match.url}`}
        exact
        render={() => (
          <Board
            columns={columns}
            options={session.options}
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
          render={() => <SummaryMode columns={columns} />}
        />
      ) : null}
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

export default GamePage;
