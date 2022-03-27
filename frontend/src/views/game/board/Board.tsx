import { useCallback } from 'react';
import styled from '@emotion/styled';
import { Post, PostGroup, SessionOptions, ColumnDefinition } from 'common';
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import Column from './Column';
import { Page } from '../../../components/Page';
import { ColumnContent } from '../types';
import {
  getMovingEntities,
  getCombiningEntities,
  calculateRank,
} from './moving-logic';
import { getNext, getMiddle, getPrevious } from '../lexorank';
import BoardHeader from './header/BoardHeader';
import useSession from '../useSession';
import Icon from 'components/Icon/Icon';

interface GameModeProps {
  columns: ColumnContent[];
  options: SessionOptions;
  search: string;
  onRenameSession: (name: string) => void;
  onAddPost: (columnIndex: number, content: string, rank: string) => void;
  onAddGroup: (columnIndex: number, rank: string) => void;
  onMovePost: (
    post: Post,
    destinationGroup: PostGroup | null,
    destinationColumn: number,
    newRank: string
  ) => void;
  onCombinePost: (post1: Post, post2: Post) => void;
  onDeletePost: (post: Post) => void;
  onLike: (post: Post, like: boolean) => void;
  onEdit: (post: Post) => void;
  onEditGroup: (group: PostGroup) => void;
  onDeleteGroup: (group: PostGroup) => void;
  onEditOptions: (options: SessionOptions) => void;
  onEditColumns: (columns: ColumnDefinition[]) => void;
  onSaveTemplate: (
    options: SessionOptions,
    columns: ColumnDefinition[]
  ) => void;
  onLockSession: (locked: boolean) => void;
}

const calculateRankForNewPost = (
  column: ColumnContent,
  placeFirst: boolean
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
  onRenameSession,
  onAddPost,
  onAddGroup,
  onMovePost,
  onCombinePost,
  onDeletePost,
  onLike,
  onEdit,
  onEditGroup,
  onDeleteGroup,
  onEditOptions,
  onEditColumns,
  onSaveTemplate,
  onLockSession,
  columns,
  options,
  search,
}: GameModeProps) {
  const { session } = useSession();

  const handleOnDragEnd = useCallback(
    (result: DropResult, _provided: ResponderProvided) => {
      if (!!result.destination) {
        const entities = getMovingEntities(
          result.draggableId,
          result.destination.droppableId,
          result.destination.index,
          columns
        );
        if (entities) {
          const newRank = calculateRank(entities.previous, entities.next);
          onMovePost(
            entities.post,
            entities.targetGroup,
            entities.targetColumn,
            newRank
          );
        }
      }
      if (!!result.combine) {
        const entities = getCombiningEntities(
          result.draggableId,
          result.combine.draggableId,
          columns
        );
        if (entities) {
          onCombinePost(entities.post1, entities.post2);
        }
      }
    },
    [onMovePost, onCombinePost, columns]
  );

  if (!session) {
    return <span>Loading...</span>;
  }

  return (
    <Page>
      <BoardHeader
        onEditColumns={onEditColumns}
        onEditOptions={onEditOptions}
        onSaveTemplate={onSaveTemplate}
        onLockSession={onLockSession}
        onRenameSession={onRenameSession}
      />
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Columns numberOfColumns={columns.length}>
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
                  calculateRankForNewPost(column, options.newPostsFirst)
                )
              }
              onAddGroup={() =>
                onAddGroup(column.index, calculateRankForNewGroup(column))
              }
              onDelete={onDeletePost}
              onLike={(post) => onLike(post, true)}
              onDislike={(post) => onLike(post, false)}
              onEdit={onEdit}
              onEditGroup={onEditGroup}
              onDeleteGroup={onDeleteGroup}
            />
          ))}
        </Columns>
      </DragDropContext>
    </Page>
  );
}

const Columns = styled.div<{ numberOfColumns: number }>`
  display: flex;
  margin-top: 30px;

  @media screen and (max-width: ${(props) => props.numberOfColumns * 320 + 100}px) {
    margin-top: 10px;
    flex-direction: column;

    > * {
      margin-bottom: 20px;
    }
  }
`;

export default GameMode;
