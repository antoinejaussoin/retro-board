import { AvatarGroup, Button } from '@mui/material';
import { useCallback } from 'react';
import useUser from '../../auth/useUser';
import CustomAvatar from '../../components/Avatar';
import useParticipants from './useParticipants';
import useSession from './useSession';

type ParticipantsProps = {
  onReady: () => void;
};

function Participants({ onReady }: ParticipantsProps) {
  const { participants } = useParticipants();
  const { session } = useSession();
  // const user = useUser();
  // const handleReady = useCallback(() => {
  //   console.log('handle ready,', user, session);
  //   if (user && session) {
  //     userReady(user.id, !session.ready.includes(user.id));
  //   }
  // }, [user, session, userReady]);
  return (
    <div>
      <AvatarGroup
        max={20}
        sx={{
          flexDirection: 'row',
        }}
      >
        {participants
          .filter((u) => u.online)
          .map((user) => {
            return (
              <>
                <CustomAvatar user={user} key={user.id} title={user.name} />
                <span>
                  {session?.ready.includes(user.id) ? 'ready!!' : 'not ready'}
                </span>
              </>
            );
          })}
      </AvatarGroup>
      <Button onClick={onReady}>Ready?</Button>
    </div>
  );
}

export default Participants;
