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
  colors,
} from '@material-ui/core';
import { Feedback } from '@material-ui/icons';
import { ColumnContent } from '../types';
import { Palette } from '../../../Theme';
import useTranslations from '../../../translations';
import { Page } from '../../../components/Page';
import SpeedDial from './SpeedDial';
import { calculateSummary } from './calculate-summary';
import { ColumnStats, ColumnStatsItem, ActionItem } from './types';
import useTranslation from '../../../translations';

interface SummaryModeProps {
  columns: ColumnContent[];
}

interface SectionProps {
  stats: ColumnStats;
}

const Section = ({ stats }: SectionProps) => {
  const { SummaryBoard: translations } = useTranslation();
  return (
    <Grid container spacing={4} component="section" role="list">
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h6" style={{ fontWeight: 300 }}>
                {stats.column.label}
              </Typography>
            }
            style={{ backgroundColor: stats.column.color }}
          />
          <CardContent>
            {stats.items.length ? (
              <PostsList items={stats.items} />
            ) : (
              <Typography variant="body1">{translations.noPosts}</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

interface GroupSummaryProps {
  group: ColumnStatsItem;
}

const GroupSummary = ({ group }: GroupSummaryProps) => {
  return (
    <GroupContainer>
      <GroupTitle>
        <Score>
          <PositiveNumber>+{group.likes}</PositiveNumber>&nbsp;
          <NegativeNumber>-{group.dislikes}</NegativeNumber>
        </Score>
        {group.content}
      </GroupTitle>
      <PostsList items={group.children} />
    </GroupContainer>
  );
};

const GroupContainer = styled.div`
  border-left: 1px dashed ${colors.grey[500]};
  margin-left: -10px;
  padding-left: 10px;
  > :nth-child(2) {
    margin-left: 15px;
  }
`;
const GroupTitle = styled.div`
  display: flex;
  font-weight: bold;
  opacity: 0.4;
`;

interface PostsListProps {
  items: ColumnStatsItem[];
}

const PostsList = ({ items }: PostsListProps) => {
  return (
    <div>
      {items.map((item) =>
        item.type === 'post' ? (
          <PostLine item={item} key={item.id} />
        ) : (
          <GroupSummary group={item} key={item.id} />
        )
      )}
    </div>
  );
};

interface PostLineProps {
  item: ColumnStatsItem;
}

const PostLine = ({ item }: PostLineProps) => {
  return (
    <Typography component="div">
      <PostContainer role="listitem">
        <Score>
          <PositiveNumber>+{item.likes}</PositiveNumber>&nbsp;
          <NegativeNumber>-{item.dislikes}</NegativeNumber>
        </Score>
        <PostContent aria-label="post content">{item.content}</PostContent>
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

interface ActionsListProps {
  actions: ActionItem[];
}

const ActionsList = ({ actions }: ActionsListProps) => {
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
              {actions.map((action) => (
                <ListItem key={action.postId}>
                  <ListItemIcon>
                    <Avatar>
                      <Feedback />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={action.action}
                    secondary={action.postContent}
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
  const stats = useMemo(() => {
    return calculateSummary(columns);
  }, [columns]);
  return (
    <Page>
      <div>
        {stats.columns.map((stat) => (
          <Section key={stat.column.index} stats={stat} />
        ))}
        {stats.actions.length ? <ActionsList actions={stats.actions} /> : null}
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
