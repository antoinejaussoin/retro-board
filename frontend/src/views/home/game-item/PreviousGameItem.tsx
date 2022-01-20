import { useCallback, useState } from 'react';
import CardBase from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { colors } from '@mui/material';
import DialogContentText from '@mui/material/DialogContentText';
import DialogContent from '@mui/material/DialogContent';
import { SessionMetadata } from 'common';
import { AvatarGroup } from '@mui/material';
import CustomAvatar from '../../../components/Avatar';
import ItemStat from '../ItemStat';
import styled from '@emotion/styled';
import useOnHover from '../../../hooks/useOnHover';
import useTranslations from '../../../translations';
import { DeleteForever } from '@mui/icons-material';
import { useEncryptionKey } from '../../../crypto/useEncryptionKey';
import useFormatDate from '../../../hooks/useFormatDate';
import { decrypt } from '../../../crypto/crypto';
import EncryptedLock from './EncryptedLock';
import PrivateSessionIcon from './PrivateSessionIcon';

interface PreviousGameItemProps {
  session: SessionMetadata;
  onClick: (session: SessionMetadata, encryptionKey: string | null) => void;
  onDelete: (session: SessionMetadata) => void;
}

const PreviousGameItem = ({
  session,
  onClick,
  onDelete,
}: PreviousGameItemProps) => {
  const {
    PreviousGame: translations,
    SessionName: { defaultSessionName },
    DeleteSession,
  } = useTranslations();
  const [encryptionKey] = useEncryptionKey(session.id);
  const formatDistanceToNow = useFormatDate();
  const [hover, hoverRef] = useOnHover<HTMLDivElement>();
  const handleClick = useCallback(() => {
    onClick(session, encryptionKey);
  }, [onClick, session, encryptionKey]);
  const handleDelete = useCallback(() => {
    setDeleteDialogOpen(false);
    onDelete(session);
  }, [onDelete, session]);
  const handleOpenDialog = useCallback(
    (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      event.stopPropagation();
      event.preventDefault();
      setDeleteDialogOpen(true);
    },
    []
  );
  const handleCloseDialog = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  return (
    <>
      <Card onClick={handleClick} raised={hover} ref={hoverRef}>
        <CardContent>
          <Typography color="textSecondary" gutterBottom component="div">
            <Top>
              <LastUpdated>
                {formatDistanceToNow(
                  Date.parse(session.created as unknown as string),
                  true
                )}
                &nbsp;
                <SessionId>{session.id}</SessionId>
              </LastUpdated>
              <Delete>
                {session.canBeDeleted ? (
                  <IconButton onClick={handleOpenDialog} size="large">
                    <DeleteForever />
                  </IconButton>
                ) : null}
              </Delete>
            </Top>
          </Typography>
          <NameContainer>
            <Typography variant="h5" component="h2">
              {decrypt(session.name, encryptionKey) || defaultSessionName}&nbsp;
            </Typography>
            <EncryptedLock session={session} />
            <PrivateSessionIcon session={session} />
          </NameContainer>
          <Typography color="textSecondary" style={{ marginBottom: 20 }}>
            {translations.createdBy} <em>{session.createdBy.name}</em>
          </Typography>
          <Stats>
            <ItemStat
              value={session.numberOfPosts}
              label={translations.posts!(session.numberOfPosts)}
              color={colors.green[500]}
            />
            <ItemStat
              value={session.participants.length}
              label={translations.participants!(session.participants.length)}
              color={colors.indigo[500]}
            />
            <ItemStat
              value={session.numberOfVotes}
              label={translations.votes!(session.numberOfVotes)}
              color={colors.red[500]}
            />
            <ItemStat
              value={session.numberOfActions}
              label={translations.actions!(session.numberOfActions)}
              color={colors.amber[500]}
            />
          </Stats>
          <AvatarGroup
            max={10}
            title={translations.participants!(session.participants.length)}
          >
            {session.participants.map((user) => {
              return <CustomAvatar user={user} key={user.id} />;
            })}
          </AvatarGroup>
        </CardContent>
      </Card>
      <Dialog
        onClose={handleCloseDialog}
        aria-labelledby="delete-session-dialog"
        open={deleteDialogOpen}
      >
        <DialogTitle id="delete-session-dialog">
          {DeleteSession.header!(
            decrypt(session.name, encryptionKey) || defaultSessionName!
          )}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>{DeleteSession.firstLine}</DialogContentText>
          <DialogContentText>{DeleteSession.secondLine}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{DeleteSession.cancel}</Button>
          <Button
            variant="contained"
            color="inherit"
            style={{ backgroundColor: colors.red[500], color: 'white' }}
            onClick={handleDelete}
          >
            {DeleteSession.yesImSure}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

const Card = styled(CardBase)`
  width: 500px;
  cursor: pointer;

  @media screen and (max-width: 500px) {
    width: calc(100vw - 40px);
    font-size: 0.5em;
  }
`;

const Stats = styled.div`
  display: flex;
  justify-content: space-evenly;
  margin-bottom: 10px;
  background-color: ${colors.grey[100]};
  margin: 0 -20px 20px;
`;

const Top = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 20px;
`;

const LastUpdated = styled.div`
  flex: 1;
`;

const Delete = styled.div`
  svg {
    color: ${colors.red[500]};
  }
  position: relative;
  left: 12px;
`;

const NameContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SessionId = styled.span`
  color: ${colors.grey[300]};
  padding-left: 5px;
`;

export default PreviousGameItem;
