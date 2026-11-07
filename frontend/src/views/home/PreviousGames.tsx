import { useCallback } from 'react';
import { useNavigate } from 'react-router';
import type { SessionMetadata } from 'common';
import { trackEvent } from '../../track';
import PreviousGameItem from './game-item/PreviousGameItem';

interface PreviousGamesProps {
  games: SessionMetadata[];
  onDelete: (session: SessionMetadata) => void;
}

const PreviousGames = ({ games, onDelete }: PreviousGamesProps) => {
  const navigate = useNavigate();
  const redirectToGame = useCallback(
    (session: SessionMetadata, encryptionKey: string | null) => {
      trackEvent('home/load-previous');
      navigate(
        `/game/${session.id}${encryptionKey ? `#${encryptionKey}` : ''}`,
      );
    },
    [navigate],
  );

  return (
    <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {games.map((session) => (
        <PreviousGameItem
          key={session.id}
          session={session}
          onDelete={onDelete}
          onClick={redirectToGame}
        />
      ))}
    </div>
  );
};

export default PreviousGames;
