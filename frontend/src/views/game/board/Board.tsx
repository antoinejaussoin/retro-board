import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Post, PostGroup, SessionOptions, SessionSettings } from 'common';
import ClosableAlert from 'components/ClosableAlert';
import Icon from 'components/Icon/Icon';
import { t } from 'i18next';
import { useEffect } from 'react';
import { cn } from 'ui/cn';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { getMiddle, getNext, getPrevious } from '../lexorank';
import useSession from '../useSession';
import { ColumnContent } from '../types';
import Column from './Column';
import {
  edgeOf,
  indexBeside,
  insertionIndex,
  isListDropData,
  isPostDragData,
  isPostDropData,
} from './drag';
import BoardHeader from './header/BoardHeader';
import {
  calculateRank,
  getCombiningEntities,
  getMovingEntities,
} from './moving-logic';

interface GameModeProps {
  columns: ColumnContent[];
  options: SessionOptions;
  search: string;
  demo: boolean;
  onAddPost: (columnIndex: number, content: string, rank: string) => void;
  onAddGroup: (columnIndex: number, rank: string) => void;
  onMovePost: (
    post: Post,
    destinationGroup: PostGroup | null,
    destinationColumn: number,
    newRank: string,
  ) => void;
  onCombinePost: (post1: Post, post2: Post) => void;
  onDeletePost: (post: Post) => void;
  onLike: (post: Post, like: boolean) => void;
  onCancelVotes: (post: Post) => void;
  onEdit: (post: Post) => void;
  onEditGroup: (group: PostGroup) => void;
  onDeleteGroup: (group: PostGroup) => void;
  onChangeSession: (session: SessionSettings, saveAsTemplate: boolean) => void;
  onLockSession: (locked: boolean) => void;
}

const calculateRankForNewPost = (
  column: ColumnContent,
  placeFirst: boolean,
): string => {
  if (column.posts.length) {
    if (placeFirst) {
      return getPrevious(column.posts[0].rank);
    } else {
      return getNext(column.posts[column.posts.length - 1].rank);
    }
  }
  return getMiddle();
};

const calculateRankForNewGroup = (column: ColumnContent): string => {
  if (column.groups.length) {
    return getNext(column.groups[column.groups.length - 1].rank);
  }
  return getMiddle();
};

function GameMode({
  onAddPost,
  onAddGroup,
  onMovePost,
  onCombinePost,
  onDeletePost,
  onLike,
  onCancelVotes,
  onEdit,
  onEditGroup,
  onDeleteGroup,
  onChangeSession,
  onLockSession,
  columns,
  options,
  search,
  demo,
}: GameModeProps) {
  const { session } = useSession();
  const stacked = useMediaQuery(
    `(max-width: ${columns.length * 340 + 100}px)`,
  );

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isPostDragData(source.data),
      onDrop({ source, location }) {
        const target = location.current.dropTargets[0];
        if (!target || !isPostDragData(source.data)) {
          return;
        }
        const postId = source.data.postId;
        if (isPostDropData(target.data) && target.data.postId !== postId) {
          const edge = edgeOf(target.element, location.current.input.clientY);
          if (edge === 'center') {
            const entities = getCombiningEntities(
              postId,
              target.data.postId,
              columns,
            );
            if (entities) {
              onCombinePost(entities.post1, entities.post2);
            }
            return;
          }
          const parent = location.current.dropTargets.find((candidate) =>
            isListDropData(candidate.data),
          );
          if (parent && isListDropData(parent.data)) {
            const entities = getMovingEntities(
              postId,
              parent.data.targetId,
              indexBeside(parent.element, target.element, edge, postId),
              columns,
            );
            if (entities) {
              onMovePost(
                entities.post,
                entities.targetGroup,
                entities.targetColumn,
                calculateRank(entities.previous, entities.next),
              );
            }
          }
          return;
        }
        if (isListDropData(target.data)) {
          const entities = getMovingEntities(
            postId,
            target.data.targetId,
            insertionIndex(
              target.element,
              location.current.input.clientY,
              postId,
            ),
            columns,
          );
          if (entities) {
            onMovePost(
              entities.post,
              entities.targetGroup,
              entities.targetColumn,
              calculateRank(entities.previous, entities.next),
            );
          }
        }
      },
    });
  }, [columns, onCombinePost, onMovePost]);

  if (!session) {
    return <span>Loading...</span>;
  }

  return (
    <div
      className={cn(
        'flex flex-col px-4 pt-3',
        stacked ? 'pb-28' : 'min-h-full flex-1 pb-4',
      )}
    >
      {demo ? (
        <div className="mb-4">
          <ClosableAlert severity="info" closable>
            {t('PostBoard.demo')}
          </ClosableAlert>
        </div>
      ) : null}
      <BoardHeader
        onChangeSession={onChangeSession}
        onLockSession={onLockSession}
      />
      <div
        className={cn('mt-3 grid', stacked ? 'mt-2 gap-10' : 'flex-1 gap-6')}
        style={{
          gridTemplateColumns: stacked
            ? '1fr'
            : `repeat(${columns.length}, minmax(0, 1fr))`,
          gridTemplateRows: stacked ? undefined : 'minmax(min-content, 1fr)',
        }}
      >
        {columns.map((column) => (
          <Column
            key={column.index}
            column={column}
            search={search}
            posts={column.posts}
            groups={column.groups}
            question={column.label}
            icon={<Icon icon={column.icon} size={24} />}
            color={column.color}
            onAdd={(content) =>
              onAddPost(
                column.index,
                content,
                calculateRankForNewPost(column, options.newPostsFirst),
              )
            }
            onAddGroup={() =>
              onAddGroup(column.index, calculateRankForNewGroup(column))
            }
            onDelete={onDeletePost}
            onLike={(post) => onLike(post, true)}
            onDislike={(post) => onLike(post, false)}
            onCancelVotes={onCancelVotes}
            onEdit={onEdit}
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            fillViewport={!stacked}
          />
        ))}
      </div>
    </div>
  );
}

export default GameMode;
