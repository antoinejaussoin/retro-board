import { Participant } from 'common';
import { useRecoilState } from 'recoil';
import { ParticipantsState } from './state';

interface UseParticipantsReturn {
  participants: Participant[];
  updateParticipants: (participants: Participant[]) => void;
}

export default function useParticipants(): UseParticipantsReturn {
  const [participants, updateParticipants] = useRecoilState(ParticipantsState);

  return { participants, updateParticipants };
}
