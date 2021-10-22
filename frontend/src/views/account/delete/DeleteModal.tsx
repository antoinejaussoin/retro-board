import { Dashboard, Note, Person, ThumbUpOutlined } from '@mui/icons-material';
import {
  Dialog,
  DialogContent,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListSubheader,
  ListItemText,
  ListItemSecondaryAction,
  Switch,
  DialogActions,
  Button,
  colors,
} from '@mui/material';
import { noop } from 'lodash';
import { useCallback, useContext, useState } from 'react';
import styled from '@emotion/styled';
import useUser from '../../../auth/useUser';
import { DeleteAccountPayload } from '@retrospected/common';
import { deleteAccount, logout } from '../../../api';
import UserContext from '../../../auth/Context';
import { useHistory } from 'react-router';

type DeleteModalProps = {
  onClose: () => void;
};

export function DeleteModal({ onClose }: DeleteModalProps) {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [deleteSessions, setDeleteSessions] = useState(false);
  const [deletePosts, setDeletePosts] = useState(false);
  const [deleteVotes, setDeleteVotes] = useState(false);
  const { setUser } = useContext(UserContext);
  const user = useUser();
  const { push } = useHistory();

  const handleDelete = useCallback(async () => {
    if (!user) {
      return null;
    }
    const payload: DeleteAccountPayload = {
      deletePosts,
      deleteSessions,
      deleteVotes,
    };
    await deleteAccount(user.id, payload);
    logout();
    setUser(null);
    push('/');
  }, [user, deletePosts, deleteSessions, deleteVotes, push, setUser]);

  if (!user) {
    return null;
  }

  return (
    <Dialog
      fullScreen={fullScreen}
      maxWidth="sm"
      fullWidth
      open
      onClose={onClose}
    >
      <DialogContent>
        <List subheader={<ListSubheader>Choose what to delete</ListSubheader>}>
          <DeleteItem checked disabled icon={<Person />}>
            Delete your account and any identities linked to your email (
            {user.email}).
          </DeleteItem>
          <DeleteItem
            checked={deleteSessions}
            onToggle={setDeleteSessions}
            icon={<Dashboard />}
          >
            <p>
              Should we delete the sessions (retrospectives) you have created?
            </p>
            {deleteSessions ? (
              <Red>
                Your sessions and all their data, including other people's posts
                and votes, will be permanently deleted.
              </Red>
            ) : (
              <Green>
                <b>Recommended</b>: Your sessions will be kept and their author
                will become an anonymous account.
              </Green>
            )}
          </DeleteItem>
          <DeleteItem
            checked={deletePosts}
            onToggle={setDeletePosts}
            icon={<Note />}
          >
            <p>Should we delete all the posts you wrote?</p>
            {deletePosts ? (
              <Red>
                Your posts, in any session, and their associated votes and
                actions will be permanently deleted.
              </Red>
            ) : (
              <Green>
                <b>Recommended</b>: Your posts will be kept, but they will
                become associated with an anonymous user.
              </Green>
            )}
          </DeleteItem>
          <DeleteItem
            checked={deleteVotes}
            onToggle={setDeleteVotes}
            icon={<ThumbUpOutlined />}
          >
            <p>Should we also delete all your votes?</p>
            {deleteVotes ? (
              <Red>
                Your votes, in all sessions will be permanently deleted.
              </Red>
            ) : (
              <Green>
                <b>Recommended</b>: Your votes will be kept, but they will
                become associated with an anonymous user.
              </Green>
            )}
          </DeleteItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="contained" onClick={handleDelete}>
          DELETE YOUR ACCOUNT
        </Button>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}

type DeleteItemProps = {
  disabled?: boolean;
  checked: boolean;
  icon: React.ReactNode;
  onToggle?: (value: boolean) => void;
};

function DeleteItem({
  children,
  disabled,
  icon,
  checked,
  onToggle,
}: React.PropsWithChildren<DeleteItemProps>) {
  return (
    <ListItem>
      <ListItemIcon>{icon}</ListItemIcon>
      <ListItemText
        primary={<ContentContainer>{children}</ContentContainer>}
        style={{ paddingRight: 20 }}
      />
      <ListItemSecondaryAction>
        <Switch
          edge="end"
          disabled={disabled}
          checked={checked}
          onChange={(_, v) => (onToggle ? onToggle(v) : noop)}
        />
      </ListItemSecondaryAction>
    </ListItem>
  );
}

const Green = styled.p`
  color: ${colors.green[700]};
`;

const Red = styled.p`
  color: ${colors.red[700]};
`;

const ContentContainer = styled.div`
  > p {
    margin: 0;
    padding: 0;
  }
`;
