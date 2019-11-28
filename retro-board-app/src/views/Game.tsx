import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import CircularProgress from '@material-ui/core/CircularProgress';
import useTranslations from '../translations';
import useGlobalState from '../state';
import { extrapolate } from '../state/columns';
import useGame from './game/useGame';
import GameMode from './game/GameMode';
import SummaryMode from './game/SummaryMode';
import { ColumnContent } from './game/types';

interface Route {
  gameId: string;
}

function GamePage() {
  const { gameId } = useParams<Route>();
  const translations = useTranslations();
  const { state } = useGlobalState();
  const { summaryMode, session } = state;
  const posts = session ? session.posts : [];
  const cols = session ? session.columns : [];

  const {
    initialised,
    onAddPost,
    onDeletePost,
    onEditPost,
    onLike,
    onRenameSession,
  } = useGame(gameId);

  const columns: ColumnContent[] = useMemo(
    () =>
      cols
        .map(col => extrapolate(col, translations))
        .map(
          (col, index) =>
            ({
              index,
              posts: posts.filter(p => p.column === index),
              ...col,
            } as ColumnContent)
        ),
    [posts, cols, translations]
  );

  if (!session) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  return (
    <div>
      {initialised && !summaryMode && (
        <GameMode
          columns={columns}
          onEdit={onEditPost}
          onAddPost={onAddPost}
          onDeletePost={onDeletePost}
          onLike={onLike}
          onRenameSession={onRenameSession}
        />
      )}
      {initialised && summaryMode && <SummaryMode columns={columns} />}
    </div>
  );
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 120px;
`;

export default GamePage;
