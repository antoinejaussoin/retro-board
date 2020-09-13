import React, { useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  Card as CardBase,
  CardContent,
  Tooltip,
  Typography,
  colors,
} from '@material-ui/core';
import { SessionMetadata } from 'retro-board-common';
import { AvatarGroup } from '@material-ui/lab';
import CustomAvatar from '../../components/Avatar';
import ItemStat from './ItemStat';
import styled from 'styled-components';
import useOnHover from '../../hooks/useOnHover';
import useTranslations, { useLanguage } from '../../translations';

interface PreviousGameItemProps {
  session: SessionMetadata;
  onClick: (session: SessionMetadata) => void;
}

const PreviousGameItem = ({ session, onClick }: PreviousGameItemProps) => {
  const {
    PreviousGame: translations,
    SessionName: { defaultSessionName },
  } = useTranslations();
  const language = useLanguage();
  const [hover, hoverRef] = useOnHover();
  const handleClick = useCallback(() => {
    onClick(session);
  }, [onClick, session]);
  return (
    <Card onClick={handleClick} raised={hover} ref={hoverRef}>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>
          {formatDistanceToNow(
            Date.parse((session.created as unknown) as string),
            { locale: language.dateLocale, addSuffix: true }
          )}
        </Typography>
        <Typography variant="h5" component="h2">
          {session.name || defaultSessionName}
        </Typography>
        <Typography color="textSecondary" style={{ marginBottom: 20 }}>
          {translations.createdBy} <em>{session.createdBy.name}</em>
        </Typography>
        <Stats>
          <ItemStat
            value={session.numberOfPosts}
            label={translations.posts!}
            color={colors.green[500]}
          />
          <ItemStat
            value={session.participants.length}
            label={translations.participants!}
            color={colors.indigo[500]}
          />
          <ItemStat
            value={
              session.numberOfNegativeVotes + session.numberOfPositiveVotes
            }
            label={translations.votes!}
            color={colors.red[500]}
          />
          <ItemStat
            value={session.numberOfActions}
            label={translations.actions!}
            color={colors.amber[500]}
          />
        </Stats>
        <AvatarGroup title={translations.participants!} spacing="small">
          {session.participants.map((user) => {
            return (
              <Tooltip title={user.name} key={user.id}>
                <CustomAvatar user={user} />
              </Tooltip>
            );
          })}
        </AvatarGroup>
      </CardContent>
    </Card>
  );
};

const Card = styled(CardBase)`
  width: 500px;
  cursor: pointer;

  @media screen and (max-width: 500px) {
    width: calc(100vw - 40px);
    font-size: 0.5em;
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 10px;
  background-color: ${colors.grey[100]};
  margin: 0 -20px 20px;
`;

export default PreviousGameItem;
