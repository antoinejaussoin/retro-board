import React from 'react';
import styled from 'styled-components';
import { Palette } from '../../../../Theme';
import Badge from '@material-ui/core/Badge';
import Tooltip from '@material-ui/core/Tooltip';
import { ThumbUpOutlined, ThumbDownOutlined } from '@material-ui/icons';
import useTranslations, { Translation } from '../../../../translations';

interface RemainingVotesProps {
  up: number | null;
  down: number | null;
}

const RemainingVotes = ({ up, down }: RemainingVotesProps) => {
  const translations = useTranslations();
  if (up === null && down === null) {
    return <div />;
  }

  return (
    <Container>
      {up !== null ? (
        <Tooltip placement="bottom" title={getTooltip(translations, up, 'up')}>
          <Badge
            badgeContent={up.toString()}
            color={up > 0 ? 'primary' : 'error'}
          >
            <ThumbUpOutlined style={{ color: Palette.positive }} />
          </Badge>
        </Tooltip>
      ) : null}
      {down !== null ? (
        <Tooltip
          placement="bottom"
          title={getTooltip(translations, down, 'down')}
        >
          <Badge
            badgeContent={down.toString()}
            color={down > 0 ? 'primary' : 'error'}
          >
            <ThumbDownOutlined style={{ color: Palette.negative }} />
          </Badge>
        </Tooltip>
      ) : null}
    </Container>
  );
};

function getTooltip(
  translations: Translation,
  value: number,
  type: 'up' | 'down'
) {
  const t = translations.Post;
  if (value === 0) {
    return t.voteRemainingNone!(type === 'up' ? t.upVote! : t.downVote!);
  }
  if (value === 1) {
    return t.voteRemainingOne!(type === 'up' ? t.upVote! : t.downVote!);
  }
  return t.voteRemainingMultiple!(
    value,
    type === 'up' ? t.upVote! : t.downVote!
  );
}

const Container = styled.div`
  display: flex;
  justify-content: flex-end;
  > * {
    margin-right: 20px;
  }
  @media (max-width: 500px) {
    padding-bottom: 10px;
  }
`;

export default RemainingVotes;
