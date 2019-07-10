import React, { useMemo } from 'react';
import {
  SentimentSatisfied,
  SentimentVeryDissatisfied,
  WbSunny,
} from '@material-ui/icons';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { PostType } from 'retro-board-common';
import useTranslations from '../translations';
import useGlobalState from '../state';
import useGame from './game/useGame';
import GameMode from './game/GameMode';
import SummaryMode from './game/SummaryMode';
import { ColumnContent } from './game/types';

interface Route {
  gameId: string;
}
interface GameProps extends RouteComponentProps<Route> {}

function GamePage({
  match: {
    params: { gameId },
  },
}: GameProps) {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const { summaryMode } = state;

  const {
    initialised,
    onAddPost,
    onDeletePost,
    onEditPost,
    onLike,
    onRenameSession,
  } = useGame(gameId);

  const columns: ColumnContent[] = useMemo(
    () => [
      {
        type: PostType.Well,
        posts: state.session.posts.filter(p => p.postType === PostType.Well),
        icon: SentimentSatisfied,
        label: translations.PostBoard.wellQuestion,
        color: '#E8F5E9',
      },
      {
        type: PostType.NotWell,
        posts: state.session.posts.filter(p => p.postType === PostType.NotWell),
        icon: SentimentVeryDissatisfied,
        label: translations.PostBoard.notWellQuestion,
        color: '#FFEBEE',
      },
      {
        type: PostType.Ideas,
        posts: state.session.posts.filter(p => p.postType === PostType.Ideas),
        icon: WbSunny,
        label: translations.PostBoard.ideasQuestion,
        color: '#FFFDE7',
      },
    ],
    [state.session.posts, translations.PostBoard]
  );

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

export default withRouter(GamePage);
