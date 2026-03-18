import { me } from 'api';
import { useSuspenseQuery } from '@tanstack/react-query';

export function useUserQuery() {
  return useSuspenseQuery({
    queryKey: ['user'],
    queryFn: me,
  });
}
