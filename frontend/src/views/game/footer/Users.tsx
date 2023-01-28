import { CheckCircle } from '@mui/icons-material';
import { AvatarGroup, Badge, colors } from '@mui/material';
import CustomAvatar from 'components/Avatar';
import useParticipants from '../useParticipants';
import useSession from '../useSession';

export default function Users() {
  const { participants } = useParticipants();
  const { session } = useSession();
  return (
    <AvatarGroup
      max={50}
      sx={{
        flexDirection: 'row',
      }}
    >
      {participants
        .filter((u) => u.online)
        .map((user) => {
          return (
            <Badge
              key={user.id}
              overlap="circular"
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              badgeContent={
                session?.ready.includes(user.id) ? (
                  <CheckCircle htmlColor={colors.green[500]} />
                ) : undefined
              }
            >
              <CustomAvatar user={user} key={user.id} title={user.name} />
            </Badge>
          );
        })}
    </AvatarGroup>
  );
}
