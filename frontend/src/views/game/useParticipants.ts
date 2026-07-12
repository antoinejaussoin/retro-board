import type { Participant } from 'common';
import { useGameStore } from './state';

interface UseParticipantsReturn {
  participants: Participant[];
  updateParticipants: (participants: Participant[]) => void;
}

export default function useParticipants(): UseParticipantsReturn {
  const participants = useGameStore((s) => s.participants);
  const updateParticipants = useGameStore((s) => s.setParticipants);

  return { participants, updateParticipants };
}
