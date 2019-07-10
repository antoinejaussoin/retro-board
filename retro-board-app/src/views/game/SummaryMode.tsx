import React from 'react';
import styled from 'styled-components';
import {
  Typography,
  Card,
  CardHeader,
  CardContent,
  Grid,
} from '@material-ui/core';
import { ColumnContent } from './types';
import { Palette } from '../../Theme';
import { Post } from 'retro-board-common';

interface SummaryModeProps {
  columns: ColumnContent[];
}

interface SectionProps {
  column: ColumnContent;
}

const Section = ({ column }: SectionProps) => (
  <Grid container spacing={4}>
    <Grid item xs={12}>
      <Card>
        <CardHeader
          title={column.label}
          style={{ backgroundColor: column.color }}
        />
        <CardContent>
          {column.posts.map(post => (
            <PostLine post={post} key={post.id} />
          ))}
        </CardContent>
      </Card>
    </Grid>
  </Grid>
);

interface PostLineProps {
  post: Post;
}

const PostLine = ({ post }: PostLineProps) => (
  <PostContainer>
    <Typography>
      <PositiveNumber>+{post.likes.length}</PositiveNumber>
      <NegativeNumber>-{post.dislikes.length}</NegativeNumber>
      &nbsp;{post.content}
    </Typography>
  </PostContainer>
);

const PositiveNumber = styled.span`
  color: ${Palette.positive};
`;

const NegativeNumber = styled.span`
  color: ${Palette.negative};
`;

const SummaryMode: React.SFC<SummaryModeProps> = ({ columns }) => {
  return (
    <div>
      <div>
        {columns.map(column => (
          <Section key={column.type} column={column} />
        ))}
      </div>
    </div>
  );
};

const PostContainer = styled.div``;

export default SummaryMode;
