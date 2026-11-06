import styled from '@emotion/styled';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Avatar from '@mui/material/Avatar';
import { colors } from '@mui/material';
import { Feedback } from '@mui/icons-material';
import { ColumnContent } from '../types';
import { Palette } from '../../../Theme';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Page } from '../../../components/Page';
import { AiSummary } from './AiSummary';
import SpeedDial from './SpeedDial';
import { useSummary } from './useSummary';
import { ColumnStats, ColumnStatsItem, ActionItem } from './types';
import useCrypto from '../../../crypto/useCrypto';
import { Box } from '@mui/system';
import { usePostUserPermissionsNullable } from '../board/usePostUserPermissions';
import { useSearch } from '../is-search-match';

interface SummaryModeProps {
  columns: ColumnContent[];
  search: string;
}

interface SectionProps {
  stats: ColumnStats;
  search: string;
}

function Section({ stats, search }: SectionProps) {
  const { t } = useTranslation();

  return (
    <Box marginBottom={2} role="list">
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
            <PostsList items={stats.items} search={search} />
          ) : (
            <Typography variant="body1">{t('SummaryBoard.noPosts')}</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

interface GroupSummaryProps {
  group: ColumnStatsItem;
  search: string;
}

function GroupSummary({ group, search }: GroupSummaryProps) {
  const { decrypt } = useCrypto();
  return (
    <GroupContainer>
      <GroupTitle>
        <Score>
          <PositiveNumber>+{group.likes}</PositiveNumber>&nbsp;
          <NegativeNumber>-{group.dislikes}</NegativeNumber>
        </Score>
        {decrypt(group.content)}
      </GroupTitle>
      <PostsList items={group.children} search={search} />
    </GroupContainer>
  );
}

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
  search: string;
}

function PostsList({ items, search }: PostsListProps) {
  const searchPredicate = useSearch(search);
  return (
    <div>
      {items
        .filter((item) => (item.post ? searchPredicate(item.post) : true))
        .map((item) =>
          item.type === 'post' ? (
            <PostLine item={item} key={item.id} />
          ) : (
            <GroupSummary group={item} key={item.id} search={search} />
          )
        )}
    </div>
  );
}

interface PostLineProps {
  item: ColumnStatsItem;
}

function PostLine({ item }: PostLineProps) {
  const { decrypt } = useCrypto();
  const permissions = usePostUserPermissionsNullable(item.post);
  const canShowAuthor = permissions && permissions.canShowAuthor;
  return (
    <PostLineContainer>
      <Typography component="div">
        <PostContainer role="listitem">
          <Score>
            <PositiveNumber>+{item.likes}</PositiveNumber>&nbsp;
            <NegativeNumber>-{item.dislikes}</NegativeNumber>
          </Score>
          <PostContent aria-label="post content">
            {decrypt(item.content)}
          </PostContent>
          {canShowAuthor ? <Author>(by {item.post?.user.name})</Author> : null}
        </PostContainer>
      </Typography>
    </PostLineContainer>
  );
}

const PostLineContainer = styled.div`
  :hover {
    background-color: ${colors.grey[50]};
  }
`;

const Author = styled.div`
  color: ${colors.grey[500]};
  font-size: 0.7rem;
  display: flex;
  align-items: center;
  padding: 0 10px;
`;

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

function ActionsList({ actions }: ActionsListProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const { decrypt } = useCrypto();
  return (
    <Grid
      container
      spacing={4}
      component="section"
      role="list"
      style={{ marginTop: 20 }}
    >
      <Grid item xs={12}>
        <Card>
          <CardHeader
            title={
              <Typography variant="h6" style={{ fontWeight: 300 }}>
                {t('Actions.summaryTitle')}
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
                    primary={decrypt(action.action)}
                    secondary={decrypt(action.postContent)}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export function SummaryMode({ columns, search }: SummaryModeProps) {
  const stats = useSummary(columns);
  const [aiSummary, setAiSummary] = useState('');
  return (
    <Page>
      <div>
        <AiSummary onSummary={setAiSummary} />
        {stats.columns.map((stat) => (
          <Section key={stat.column.index} stats={stat} search={search} />
        ))}
        {stats.actions.length ? <ActionsList actions={stats.actions} /> : null}
      </div>
      <SpeedDialContainer>
        <SpeedDial summary={aiSummary} />
      </SpeedDialContainer>
    </Page>
  );
}

const SpeedDialContainer = styled.div`
  position: fixed;
  bottom: 85px;
  right: 20px;
  z-index: 3;
`;
