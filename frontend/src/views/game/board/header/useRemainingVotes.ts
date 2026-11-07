import { useMemo } from 'react';
import useUser from '../../../../state/user/useUser';
import useSession from '../../useSession';
import { numberOfVotes } from '../permissions-logic';

export type VoteAllowance = number | 'unlimited';

interface RemainingVotes {
  up: VoteAllowance | null;
  down: VoteAllowance | null;
}

export function remainingAllowance(
  max: number | null,
  used: number,
): VoteAllowance | null {
  if (max === 0) {
    return null;
  }
  if (max === null) {
    return 'unlimited';
  }
  return Math.max(max - used, 0);
}

export default function useRemainingVotes(): RemainingVotes {
  const { session } = useSession();
  const user = useUser();

  const result = useMemo(() => {
    if (!session || !user) {
      return { up: null, down: null };
    }
    const upVotes = numberOfVotes('like', user.id, session);
    const downVotes = numberOfVotes('dislike', user.id, session);

    return {
      up: remainingAllowance(session.options.maxUpVotes, upVotes),
      down: remainingAllowance(session.options.maxDownVotes, downVotes),
    };
  }, [session, user]);

  return result;
}
