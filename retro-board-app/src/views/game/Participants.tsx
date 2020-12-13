import { AvatarGroup } from '@material-ui/lab';
import React from 'react';
import CustomAvatar from '../../components/Avatar';
import useGlobalState from '../../state';

function Participants() {
  const {
    state: { players },
  } = useGlobalState();
  return (
    <div>
      <AvatarGroup max={20}>
        {players
          .filter((u) => u.online)
          .map((user) => {
            return <CustomAvatar user={user} key={user.id} title={user.name} />;
          })}
      </AvatarGroup>
    </div>
  );
}

export default Participants;
