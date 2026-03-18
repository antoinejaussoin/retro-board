import type { Participant } from 'common';
import { useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const PARTICIPANTS_QUERY_KEY = ['game-participants'] as const;

interface UseParticipantsReturn {
  participants: Participant[];
  updateParticipants: (participants: Participant[]) => void;
}

export default function useParticipants(): UseParticipantsReturn {
  const queryClient = useQueryClient();
  const { data: participants = [] } = useQuery<Participant[]>({
    queryKey: PARTICIPANTS_QUERY_KEY,
    queryFn: () => [],
    gcTime: Number.POSITIVE_INFINITY,
    staleTime: Number.POSITIVE_INFINITY,
  });

  const updateParticipants = useCallback(
    (participants: Participant[]) => {
      queryClient.setQueryData<Participant[]>(
        PARTICIPANTS_QUERY_KEY,
        participants,
      );
    },
    [queryClient],
  );

  return { participants, updateParticipants };
}
