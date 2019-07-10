import React, { SFC, useState, useCallback } from 'react';
import styled from 'styled-components';
import { Input, InputAdornment, makeStyles } from '@material-ui/core';
import PostItem from './Post';
import { Post } from 'retro-board-common';

interface ColumnProps {
  posts: Post[];
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  question: string;
  color: string;
  onAdd: (content: string) => void;
  onLike: (post: Post) => void;
  onDislike: (post: Post) => void;
  onEdit: (post: Post) => void;
  onDelete: (post: Post) => void;
}

const useStyles = makeStyles({
  icon: {
    color: 'grey',
  },
});

const Column: SFC<ColumnProps> = ({
  posts,
  icon: Icon,
  question,
  color,
  onAdd,
  onLike,
  onDislike,
  onEdit,
  onDelete,
}) => {
  const [content, setContent] = useState('');
  const onContentChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setContent(e.target.value),
    [setContent]
  );
  const classes = useStyles();
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.keyCode === 13 && content) {
        onAdd(content);
        setContent('');
      }
    },
    [onAdd, setContent, content]
  );
  return (
    <ColumnWrapper>
      <Add>
        <Input
          placeholder={question}
          onChange={onContentChange}
          value={content}
          onKeyDown={onKeyDown}
          startAdornment={
            <InputAdornment position="start">
              <Icon className={classes.icon} />
            </InputAdornment>
          }
        />
      </Add>
      <div>
        {posts.map(post => (
          <PostItem
            key={post.id}
            post={post}
            color={color}
            onLike={() => onLike(post)}
            onDislike={() => onDislike(post)}
            onDelete={() => onDelete(post)}
            onEdit={content =>
              onEdit({
                ...post,
                content,
              })
            }
          />
        ))}
      </div>
    </ColumnWrapper>
  );
};

const ColumnWrapper = styled.div`
  flex: 1;
  margin-bottom: 10px;
  padding: 0 5px;
`;

const Add = styled.div`
  margin-bottom: 20px;

  > div {
    width: 100%;
  }
  input {
    width: 100%;
  }
`;

export default Column;
