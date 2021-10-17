import { Cancel, Check, CheckCircle } from '@mui/icons-material';
import { AvatarGroup, Badge, Button, colors } from '@mui/material';
import CustomAvatar from '../../components/Avatar';
import useParticipants from './useParticipants';
import useSession from './useSession';
import styled from '@emotion/styled';
import useUser from '../../auth/useUser';
import useTranslation from '../../translations/useTranslations';

type ParticipantsProps = {
  onReady: () => void;
};

function Participants({ onReady }: ParticipantsProps) {
  const { participants } = useParticipants();
  const { session } = useSession();
  const user = useUser();
  const { PostBoard: translations } = useTranslation();
  const isUserReady = !!user && !!session && session.ready.includes(user.id);
  return (
    <Container>
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
      <Button
        onClick={onReady}
        variant="outlined"
        endIcon={
          isUserReady ? (
            <Cancel htmlColor={colors.red[500]} />
          ) : (
            <Check htmlColor={colors.green[500]} />
          )
        }
      >
        {isUserReady ? translations.iAmNotDoneYet : translations.iAmDone}
      </Button>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  > :first-child {
    flex: 1;
  }
`;

export default Participants;
