import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Post, PostGroup, SessionOptions } from 'retro-board-common';
import { Typography, makeStyles, Box } from '@material-ui/core';
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import useTranslations from '../../translations';
import useGlobalState from '../../state';
import useRemainingVotes from './useRemainingVotes';
import { getIcon } from '../../state/icons';
import Column from './Column';
import EditableLabel from '../../components/EditableLabel';
import { Page } from '../../components/Page';
import { ColumnContent } from './types';
import RemainingVotes from './RemainingVotes';
import useUser from '../../auth/useUser';
import { Alert } from '@material-ui/lab';
import {
  getMovingEntities,
  getCombiningEntities,
  calculateRank,
} from './moving-logic';
import { getNext, getMiddle } from './lexorank';

interface GameModeProps {
  columns: ColumnContent[];
  options: SessionOptions;
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
}

const useStyles = makeStyles({
  sessionName: {
    fontWeight: 300,
  },
  container: {
    marginTop: 20,
  },
});

const calculateRankForNewPost = (column: ColumnContent): string => {
  if (column.posts.length) {
    return getNext(column.posts[column.posts.length - 1].rank);
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
  columns,
  options,
}: GameModeProps) {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const classes = useStyles();
  const remainingVotes = useRemainingVotes();
  const user = useUser();
  const isLoggedIn = !!user;

  const handleOnDragEnd = useCallback(
    (result: DropResult, provided: ResponderProvided) => {
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

  if (!state.session) {
    return <span>Loading...</span>;
  }

  return (
    <Page>
      {!isLoggedIn ? (
        <Alert severity="warning">{translations.PostBoard.notLoggedIn}</Alert>
      ) : null}
      <Box className={classes.container}>
        <HeaderWrapper>
          <div />
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            paragraph
            className={classes.sessionName}
          >
            <EditableLabel
              placeholder={translations.SessionName.defaultSessionName}
              value={state.session.name || ''}
              centered
              onChange={onRenameSession}
              readOnly={!isLoggedIn}
            />
          </Typography>
          <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
        </HeaderWrapper>

        <DragDropContext onDragEnd={handleOnDragEnd}>
          <Columns numberOfColumns={columns.length}>
            {columns.map((column) => (
              <Column
                column={column}
                options={options}
                key={column.index}
                posts={column.posts}
                groups={column.groups}
                question={column.label}
                icon={getIcon(column.icon)}
                color={column.color}
                onAdd={(content) =>
                  onAddPost(
                    column.index,
                    content,
                    calculateRankForNewPost(column)
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
      </Box>
    </Page>
  );
}

const Columns = styled.div<{ numberOfColumns: number }>`
  display: flex;
  margin-top: 30px;

  @media screen and (max-width: ${(props) =>
      props.numberOfColumns * 320 + 100}px) {
    margin-top: 10px;
    flex-direction: column;

    > * {
      margin-bottom: 20px;
    }
  }
`;

const HeaderWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  > *:first-child {
    width: 90px;
  }

  > *:nth-child(2) {
    flex: 1;
    margin: 0 20px;
  }

  > *:last-child {
    width: 90px;
  }

  @media (max-width: 500px) {
    margin-top: 40px;
    flex-direction: column;

    > *:last-child {
      margin: 20px 0;
    }
  }
`;

export default GameMode;
