import React, { useMemo } from 'react';
import styled from 'styled-components';
import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
} from '@material-ui/core';
import { Feedback } from '@material-ui/icons';
import { ColumnContent } from '../types';
import { Palette } from '../../../Theme';
import useTranslations from '../../../translations';
import { Post } from 'retro-board-common';
import { countVotes, sortPostByVote } from '../utils';
import { Page } from '../../../components/Page';
import SpeedDial from './SpeedDial';

interface SummaryModeProps {
  columns: ColumnContent[];
}

interface SectionProps {
  column: ColumnContent;
}

const Section = ({ column }: SectionProps) => (
  <Grid container spacing={4} component="section" role="list">
    <Grid item xs={12}>
      <Card>
        <CardHeader
          title={
            <Typography variant="h6" style={{ fontWeight: 300 }}>
              {column.label}
            </Typography>
          }
          style={{ backgroundColor: column.color }}
        />
        <CardContent>
          {column.posts.length ? (
            <PostsList posts={column.posts} />
          ) : (
            <Typography variant="body1">No posts in this category.</Typography>
          )}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

interface PostsListProps {
  posts: Post[];
}

const PostsList = ({ posts }: PostsListProps) => {
  const sortedList = useMemo(() => {
    return [...posts].sort(sortPostByVote);
  }, [posts]);
  return (
    <>
      {sortedList.map(post => (
        <PostLine post={post} key={post.id} />
      ))}
    </>
  );
};

interface PostLineProps {
  post: Post;
}

const PostLine = ({ post }: PostLineProps) => {
  const likes = useMemo(() => countVotes(post, 'like'), [post]);
  const dislikes = useMemo(() => countVotes(post, 'dislike'), [post]);
  return (
    <Typography>
      <PostContainer role="listitem">
        <Score>
          <PositiveNumber>+{likes}</PositiveNumber>&nbsp;
          <NegativeNumber>-{dislikes}</NegativeNumber>
        </Score>
        <PostContent aria-label="post content">{post.content}</PostContent>
      </PostContainer>
    </Typography>
  );
};

const PostContainer = styled.div`
  display: flex;
`;

const Score = styled.div`
  margin-right: 10px;
`;

const PositiveNumber = styled.span`
  color: ${Palette.positive};
`;

const NegativeNumber = styled.span`
  color: ${Palette.negative};
`;

const PostContent = styled.span`
  white-space: pre-wrap;
  flex: 1;
`;

const ActionsList = ({ posts }: PostsListProps) => {
  const theme = useTheme();
  const {
    Actions: { summaryTitle },
  } = useTranslations();
  return (
    <Grid
      container
      spacing={4}
      component="section"
      role="list"
      style={{ marginTop: 30 }}
    >
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h6" style={{ fontWeight: 300 }}>
                {summaryTitle}
              </Typography>
            }
            style={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
            }}
          />
          <CardContent>
            <List>
              {posts.map(post => (
                <ListItem key={post.id}>
                  <ListItemIcon>
                    <Avatar>
                      <Feedback />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={post.action}
                    secondary={post.content}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

const SummaryMode: React.SFC<SummaryModeProps> = ({ columns }) => {
  const posts = useMemo(() => {
    return columns.reduce<Post[]>((prev, current) => {
      return [...prev, ...current.posts.filter(post => !!post.action)];
    }, []);
  }, [columns]);
  return (
    <Page>
      <div>
        {columns.map(column => (
          <Section key={column.index} column={column} />
        ))}
        {posts.length ? <ActionsList posts={posts} /> : null}
      </div>
      <SpeedDialContainer>
        <SpeedDial />
      </SpeedDialContainer>
    </Page>
  );
};

const SpeedDialContainer = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
`;

export default SummaryMode;
