import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { Post, PostGroup, SessionOptions, SessionSettings } from 'common';
import ClosableAlert from 'components/ClosableAlert';
import Icon from 'components/Icon/Icon';
import { t } from 'i18next';
import { useCallback, useEffect, useRef } from 'react';
import { cn } from 'ui/cn';
import { useMediaQuery } from '../../../hooks/useMediaQuery';
import { getMiddle, getNext, getPrevious } from '../lexorank';
import useSession from '../useSession';
import { ColumnContent } from '../types';
import Column from './Column';
import {
  elementsAt,
  intentFromNativeDrop,
  isPostDragData,
  resolveTouchDrop,
} from './drag';
import BoardHeader from './header/BoardHeader';
import { settlePostDrop } from './moving-logic';

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
  onReact: (post: Post, emoji: string) => void;
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
  onReact,
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
  const columnsRef = useRef(columns);
  columnsRef.current = columns;
  const onMovePostRef = useRef(onMovePost);
  onMovePostRef.current = onMovePost;
  const onCombinePostRef = useRef(onCombinePost);
  onCombinePostRef.current = onCombinePost;
  const handleTouchDrop = useCallback(
    (postId: string, clientX: number, clientY: number) => {
      const resolved = resolveTouchDrop({
        elements: elementsAt(clientX, clientY),
        clientY,
        draggingId: postId,
      });
      if (!resolved) {
        return;
      }
      settlePostDrop(resolved.intent, columnsRef.current, {
        onMovePost: onMovePostRef.current,
        onCombinePost: onCombinePostRef.current,
      });
    },
    [],
  );

  useEffect(() => {
    return monitorForElements({
      canMonitor: ({ source }) => isPostDragData(source.data),
      onDrop({ source, location }) {
        const intent = intentFromNativeDrop(
          source.data,
          location.current.dropTargets,
          location.current.input.clientY,
        );
        if (intent) {
          settlePostDrop(intent, columns, { onMovePost, onCombinePost });
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
        <ClosableAlert severity="info" closable className="mb-4">
          {t('PostBoard.demo')}
        </ClosableAlert>
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
            onReact={onReact}
            onEdit={onEdit}
            onEditGroup={onEditGroup}
            onDeleteGroup={onDeleteGroup}
            onTouchDrop={handleTouchDrop}
            fillViewport={!stacked}
          />
        ))}
      </div>
    </div>
  );
}

export default GameMode;
