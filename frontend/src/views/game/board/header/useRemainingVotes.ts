import { useMemo } from 'react';
import useUser from '../../../../state/user/useUser';
import useSession from '../../useSession';
import { numberOfVotes } from '../permissions-logic';

interface RemainingVotes {
  up: number | null;
  down: number | null;
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
      up:
        session.options.maxUpVotes !== null
          ? Math.max(session.options.maxUpVotes - upVotes, 0)
          : null,
      down:
        session.options.maxDownVotes !== null
          ? Math.max(session.options.maxDownVotes - downVotes, 0)
          : null,
    };
  }, [session, user]);

  return result;
}
