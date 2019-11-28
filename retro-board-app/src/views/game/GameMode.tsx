import React from 'react';
import styled from 'styled-components';
import { Post } from 'retro-board-common';
import { Typography, makeStyles, Box } from '@material-ui/core';
import useTranslations from '../../translations';
import useGlobalState from '../../state';
import useRemainingVotes from './useRemainingVotes';
import { getIcon } from '../../state/icons';
import Column from './Column';
import EditableLabel from '../../components/EditableLabel';
import { Page } from '../../components/Page';
import { ColumnContent } from './types';
import RemainingVotes from './RemainingVotes';

interface GameModeProps {
  columns: ColumnContent[];
  onRenameSession: (name: string) => void;
  onAddPost: (columnIndex: number, content: string) => void;
  onDeletePost: (post: Post) => void;
  onLike: (post: Post, like: boolean) => void;
  onEdit: (post: Post) => void;
}

const useStyles = makeStyles({
  sessionName: {
    fontWeight: 300,
  },
  container: {
    marginTop: 20,
  },
});

function GameMode({
  onRenameSession,
  onAddPost,
  onDeletePost,
  onLike,
  onEdit,
  columns,
}: GameModeProps) {
  const translations = useTranslations();
  const { state } = useGlobalState();
  const classes = useStyles();
  const remainingVotes = useRemainingVotes();

  if (!state.session) {
    return <span>Loading...</span>;
  }

  return (
    <Page>
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
            />
          </Typography>
          <RemainingVotes up={remainingVotes.up} down={remainingVotes.down} />
        </HeaderWrapper>

        <Columns numberOfColumns={columns.length}>
          {columns.map(column => (
            <Column
              key={column.index}
              posts={column.posts}
              question={column.label}
              icon={getIcon(column.icon)}
              color={column.color}
              onAdd={content => onAddPost(column.index, content)}
              onDelete={onDeletePost}
              onLike={post => onLike(post, true)}
              onDislike={post => onLike(post, false)}
              onEdit={onEdit}
            />
          ))}
        </Columns>
      </Box>
    </Page>
  );
}

const Columns = styled.div<{ numberOfColumns: number }>`
  display: flex;
  margin-top: 30px;

  @media screen and (max-width: ${props =>
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
    flex-direction: column;
    > *:last-child {
      margin: 20px 0;
    }
  }
`;

export default GameMode;
