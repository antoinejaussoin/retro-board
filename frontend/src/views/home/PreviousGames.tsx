import { useCallback } from 'react';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router';
import PreviousGameItem from './game-item/PreviousGameItem';
import { SessionMetadata } from 'common';
import { trackEvent } from '../../track';

interface PreviousGamesProps {
  games: SessionMetadata[];
  onDelete: (session: SessionMetadata) => void;
}

const PreviousGames = ({ games, onDelete }: PreviousGamesProps) => {
  const history = useNavigate();
  const redirectToGame = useCallback(
    (session: SessionMetadata, encryptionKey: string | null) => {
      trackEvent('home/load-previous');
      history(`/game/${session.id}${encryptionKey ? '#' + encryptionKey : ''}`);
    },
    [history]
  );

  return (
    <Container>
      {games.map((session) => (
        <PreviousGameItem
          key={session.id}
          session={session}
          onDelete={onDelete}
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
