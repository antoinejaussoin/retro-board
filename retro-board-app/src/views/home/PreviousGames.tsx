import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router';
import PreviousGameItem from './PreviousGameItem';
import { SessionMetadata } from 'retro-board-common';
import { trackEvent } from '../../track';

interface PreviousGamesProps {
  games: SessionMetadata[];
}

const PreviousGames = ({ games }: PreviousGamesProps) => {
  const history = useHistory();
  const redirectToGame = useCallback(
    (session: SessionMetadata) => {
      trackEvent('home/load-previous');
      history.push(`/game/${session.id}`);
    },
    [history]
  );
  return (
    <Container>
      {games.map((session) => (
        <PreviousGameItem
          key={session.id}
          session={session}
          onClick={redirectToGame}
        />
      ))}
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  > * {
    margin: 20px;
  }
`;

export default PreviousGames;
