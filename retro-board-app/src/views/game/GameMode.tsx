import React from 'react';
import styled from 'styled-components';
import { PostType, Post } from 'retro-board-common';
import { Typography, makeStyles, Box } from '@material-ui/core';
import useTranslations from '../../translations';
import useGlobalState from '../../state';
import Column from './Column';
import EditableLabel from '../../components/EditableLabel';
import { ColumnContent } from './types';

interface GameModeProps {
  columns: ColumnContent[];
  onRenameSession: (name: string) => void;
  onAddPost: (type: PostType, content: string) => void;
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

  return (
    <Box className={classes.container}>
      <Typography
        variant="h5"
        align="center"
        gutterBottom
        paragraph
        className={classes.sessionName}
      >
        <EditableLabel
          placeholder={translations.SessionName.defaultSessionName}
          value={state.session.name}
          centered
          onChange={onRenameSession}
        />
      </Typography>
      <Columns>
        {columns.map(column => (
          <Column
            key={column.type}
            posts={column.posts}
            question={column.label}
            icon={column.icon}
            color={column.color}
            onAdd={content => onAddPost(column.type, content)}
            onDelete={onDeletePost}
            onLike={post => onLike(post, true)}
            onDislike={post => onLike(post, false)}
            onEdit={onEdit}
          />
        ))}
      </Columns>
    </Box>
  );
}

const Columns = styled.div`
  display: flex;
  margin-top: 30px;

  @media screen and (max-width: 900px) {
    margin-top: 10px;
    flex-direction: column;

    > * {
      margin-bottom: 20px;
    }
  }
`;

export default GameMode;
