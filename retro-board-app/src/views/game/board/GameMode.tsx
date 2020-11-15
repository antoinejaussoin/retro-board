import React, { useCallback } from 'react';
import styled from 'styled-components';
import {
  Post,
  PostGroup,
  SessionOptions,
  ColumnDefinition,
} from 'retro-board-common';
import { Typography, makeStyles, Box } from '@material-ui/core';
import {
  DragDropContext,
  DropResult,
  ResponderProvided,
} from 'react-beautiful-dnd';
import useTranslations from '../../../translations';
import useGlobalState from '../../../state';
import useRemainingVotes from './useRemainingVotes';
import useCanReveal from './useCanReveal';
import { getIcon } from '../../../state/icons';
import Column from './Column';
import EditableLabel from '../../../components/EditableLabel';
import { Page } from '../../../components/Page';
import { ColumnContent } from '../types';
import RemainingVotes from './RemainingVotes';
import useUser from '../../../auth/useUser';
import { Alert } from '@material-ui/lab';
import {
  getMovingEntities,
  getCombiningEntities,
  calculateRank,
} from './moving-logic';
import { getNext, getMiddle } from '../lexorank';
import RevealButton from './RevealButton';
import ModifyOptions from './ModifyOptions';
import useCanModifyOptions from './useCanModifyOptions';
import useCrypto from '../../../crypto/useCrypto';
import useCanDecrypt from '../../../crypto/useCanDecrypt';
import EncryptionModal from './EncryptionModal';
import useShouldDisplayEncryptionWarning from './useShouldDisplayEncryptionWarning';
import TransitionAlert from '../../../components/TransitionAlert';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import LockSession from './LockSession';

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
  onEditOptions: (options: SessionOptions) => void;
  onEditColumns: (columns: ColumnDefinition[]) => void;
  onLockSession: (locked: boolean) => void;
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
  onEditOptions,
  onEditColumns,
  onLockSession,
  columns,
  options,
}: GameModeProps) {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const classes = useStyles();
  const [key] = useEncryptionKey();
  const remainingVotes = useRemainingVotes();
  const user = useUser();
  const isLoggedIn = !!user;
  const canReveal = useCanReveal();
  const canModifyOptions = useCanModifyOptions();
  const { encrypt, decrypt } = useCrypto();
  const canDecrypt = useCanDecrypt();
  const shouldDisplayEncryptionWarning = useShouldDisplayEncryptionWarning();

  const handleReveal = useCallback(() => {
    if (state && state.session) {
      const modifiedOptions: SessionOptions = {
        ...state.session.options,
        blurCards: false,
      };
      onEditOptions(modifiedOptions);
    }
  }, [onEditOptions, state]);

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

  const handleRenameSession = useCallback(
    (name: string) => {
      onRenameSession(encrypt(name));
    },
    [onRenameSession, encrypt]
  );

  if (!state.session) {
    return <span>Loading...</span>;
  }

  return (
    <Page>
      {!canDecrypt ? <EncryptionModal /> : null}
      {!isLoggedIn ? (
        <Alert severity="warning">{translations.PostBoard.notLoggedIn}</Alert>
      ) : null}
      {!canDecrypt ? (
        <Alert severity="error">
          {translations.Encryption.sessionEncryptionError}
        </Alert>
      ) : null}

      <Box className={classes.container}>
        <HeaderWrapper>
          <LeftOptions>
            {canReveal ? <RevealButton onClick={handleReveal} /> : null}
            {canModifyOptions ? (
              <ModifyOptions
                onEditOptions={onEditOptions}
                onEditColumns={onEditColumns}
              />
            ) : null}
          </LeftOptions>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            paragraph
            className={classes.sessionName}
          >
            <EditableLabel
              placeholder={translations.SessionName.defaultSessionName}
              value={decrypt(state.session.name)}
              centered
              onChange={handleRenameSession}
              readOnly={!isLoggedIn || !canDecrypt}
            />
          </Typography>
          <RightOptions>
            {canModifyOptions ? <LockSession onLock={onLockSession} /> : null}
          </RightOptions>
        </HeaderWrapper>
        <SubHeader>
          <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
        </SubHeader>
        {shouldDisplayEncryptionWarning ? (
          <TransitionAlert
            severity="warning"
            title={translations.Encryption.newEncryptedSessionWarningTitle}
          >
            {translations.Encryption.newEncryptedSessionWarningContent!(
              key || '(unknown)'
            )}
          </TransitionAlert>
        ) : null}
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
  margin-bottom: 20px;

  > *:first-child {
    flex: 1;
  }

  > *:nth-child(2) {
    flex: 3;
    margin: 0 20px;
  }

  > *:last-child {
    flex: 1;
  }

  @media (max-width: 500px) {
    margin-top: 40px;
    flex-direction: column;
    margin-bottom: 0px;

    > *:last-child {
      margin: 20px 0;
    }
  }
`;

const SubHeader = styled.div`
  display: flex;
  justify-content: center;
`;

const LeftOptions = styled.div`
  display: flex;
  justify-content: flex-start;

  > * {
    margin-right: 10px;
  }

  @media (max-width: 500px) {
    margin-bottom: 20px;
    margin-top: -15px;
    order: 6;
  }
`;

const RightOptions = styled.div`
  display: flex;
  justify-content: flex-end;

  > * {
    margin-right: 10px;
  }

  @media (max-width: 500px) {
    margin-bottom: 20px;
    margin-top: -15px;
    order: 6;
  }
`;

export default GameMode;
