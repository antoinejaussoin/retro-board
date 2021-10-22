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
} from '@mui/material';
import { noop } from 'lodash';
import { useState } from 'react';

type DeleteModalProps = {
  onClose: () => void;
};

export function DeleteModal({ onClose }: DeleteModalProps) {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [deleteSessions, setDeleteSessions] = useState(false);
  const [deletePosts, setDeletePosts] = useState(false);
  const [deleteVotes, setDeleteVotes] = useState(false);
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
            Delete your account and any identities linked to your email
          </DeleteItem>
          <DeleteItem
            checked={deleteSessions}
            onToggle={setDeleteSessions}
            icon={<Dashboard />}
          >
            Delete all the sessions you created. This will delete all posts and
            votes related to this session, which means it will impact other
            people.
          </DeleteItem>
          <DeleteItem
            checked={deletePosts}
            onToggle={setDeletePosts}
            icon={<Note />}
          >
            Delete all the posts you wrote. They will be deleted from all
            sessions, including sessions you did not create.
          </DeleteItem>
          <DeleteItem
            checked={deleteVotes}
            onToggle={setDeleteVotes}
            icon={<ThumbUpOutlined />}
          >
            Delete all your votes. This will impact any session you participated
            on.
          </DeleteItem>
        </List>
      </DialogContent>
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
      <ListItemText primary={children} />
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
