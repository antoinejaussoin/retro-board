import { AvatarGroup } from '@material-ui/lab';
import CustomAvatar from '../../components/Avatar';
import useParticipants from './useParticipants';

function Participants() {
  const { participants } = useParticipants();
  return (
    <div>
      <AvatarGroup max={20}>
        {participants
          .filter((u) => u.online)
          .map((user) => {
            return <CustomAvatar user={user} key={user.id} title={user.name} />;
          })}
      </AvatarGroup>
    </div>
  );
}

export default Participants;
