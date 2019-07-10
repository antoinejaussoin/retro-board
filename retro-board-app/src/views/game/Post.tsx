import React, { SFC } from 'react';
import { some } from 'lodash';
import styled from 'styled-components';
import { Button, Typography } from '@material-ui/core';
import {
  ThumbUpOutlined,
  ThumbDownOutlined,
  DeleteForeverOutlined,
} from '@material-ui/icons';
import useGlobalState from '../../state';
import EditableLabel from '../../components/EditableLabel';
import { Palette } from '../../Theme';
import { Post } from 'retro-board-common';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';

interface PostItemProps {
  post: Post;
  color: string;
  onLike: () => void;
  onDislike: () => void;
  onEdit: (content: string) => void;
  onDelete: () => void;
}

const PostItem: SFC<PostItemProps> = ({
  post,
  color,
  onLike,
  onDislike,
  onEdit,
  onDelete,
}) => {
  const { state } = useGlobalState();
  const user = state.username;
  const isAuthor = user ? user.id === post.user.id : false;
  const hasVotedOrAuthor =
    some(post.likes, u => u.id === (user ? user.id : -1)) ||
    some(post.dislikes, u => u.id === (user ? user.id : -1)) ||
    isAuthor;
  return (
    <PostCard>
      <CardContent>
        <Typography variant="body1">
          <EditableLabel
            readOnly={!isAuthor}
            value={post.content}
            onChange={onEdit}
            label="Post content"
          />
        </Typography>
      </CardContent>
      <CardActions style={{ backgroundColor: color }}>
        <Button onClick={onLike} disabled={hasVotedOrAuthor} aria-label="Like">
          <ThumbUpOutlined style={{ color: Palette.positive }} />
          &nbsp;{post.likes.length}
        </Button>
        <Button
          onClick={onDislike}
          disabled={hasVotedOrAuthor}
          aria-label="Dislike"
        >
          <ThumbDownOutlined style={{ color: Palette.negative }} />
          &nbsp;{post.dislikes.length}
        </Button>
        {isAuthor && (
          <Button onClick={onDelete} aria-label="Delete">
            <DeleteForeverOutlined style={{ color: Palette.negative }} />
          </Button>
        )}
      </CardActions>
    </PostCard>
  );
};

const PostCard = styled(Card)`
  margin: 10px 5px;
  margin-bottom: 20px;
`;

export default PostItem;
