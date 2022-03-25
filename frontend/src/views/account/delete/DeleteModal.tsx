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
import { DeleteAccountPayload } from 'common';
import { deleteAccount, logout } from '../../../api';
import UserContext from '../../../auth/Context';
import { useNavigate } from 'react-router';
import { useConfirm } from 'material-ui-confirm';
import { useSnackbar } from 'notistack';
import useTranslations from '../../../translations';
import { trackEvent } from '../../../track';

type DeleteModalProps = {
  onClose: () => void;
};

export function DeleteModal({ onClose }: DeleteModalProps) {
  const fullScreen = useMediaQuery('(max-width:600px)');
  const [deleteSessions, setDeleteSessions] = useState(false);
  const [deletePosts, setDeletePosts] = useState(false);
  const [deleteVotes, setDeleteVotes] = useState(false);
  const { setUser } = useContext(UserContext);
  const { enqueueSnackbar } = useSnackbar();
  const user = useUser();
  const push = useNavigate();
  const confirm = useConfirm();
  const {
    AccountPage: {
      deleteAccount: { modal: translations },
    },
  } = useTranslations();

  const handleDelete = useCallback(async () => {
    if (!user) {
      return null;
    }
    const payload: DeleteAccountPayload = {
      deletePosts,
      deleteSessions,
      deleteVotes,
    };
    confirm({
      title: translations.confirm.title,
      description: translations.confirm.description,
      confirmationText: translations.confirm.confirmation,
      cancellationText: translations.confirm.cancellation,
      confirmationButtonProps: { color: 'error', variant: 'contained' },
    })
      .then(async () => {
        trackEvent('account/gdpr/delete-account');
        const success = await deleteAccount(payload);
        if (success) {
          logout();
          setUser(null);
          push('/');
        } else {
          enqueueSnackbar(
            'Deleting your account failed. Please contact support: support@retrospected.com',
            { variant: 'error' }
          );
          onClose();
        }
      })
      .catch(() => {
        onClose();
      });
  }, [
    user,
    deletePosts,
    deleteSessions,
    deleteVotes,
    push,
    setUser,
    confirm,
    onClose,
    translations,
    enqueueSnackbar,
  ]);

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
        <List
          subheader={<ListSubheader>{translations.subheader}</ListSubheader>}
        >
          <DeleteItem checked disabled icon={<Person />}>
            {translations.deleteAccount} ({user.email})
          </DeleteItem>
          <DeleteItem
            checked={deleteSessions}
            onToggle={setDeleteSessions}
            icon={<Dashboard />}
          >
            <p>{translations.deleteSessions.main}</p>
            {deleteSessions ? (
              <Red>{translations.deleteSessions.selected}</Red>
            ) : (
              <Green>
                <b>{translations.recommended}</b> -{' '}
                {translations.deleteSessions.unselected}
              </Green>
            )}
          </DeleteItem>
          <DeleteItem
            checked={deletePosts}
            onToggle={setDeletePosts}
            icon={<Note />}
          >
            <p>{translations.deletePosts.main}</p>
            {deletePosts ? (
              <Red>{translations.deletePosts.selected}</Red>
            ) : (
              <Green>
                <b>{translations.recommended}</b> -{' '}
                {translations.deletePosts.unselected}
              </Green>
            )}
          </DeleteItem>
          <DeleteItem
            checked={deleteVotes}
            onToggle={setDeleteVotes}
            icon={<ThumbUpOutlined />}
          >
            <p>{translations.deleteVotes.main}</p>
            {deleteVotes ? (
              <Red>{translations.deleteVotes.selected}</Red>
            ) : (
              <Green>
                <b>{translations.recommended}</b> -{' '}
                {translations.deleteVotes.unselected}
              </Green>
            )}
          </DeleteItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button color="error" variant="contained" onClick={handleDelete}>
          {translations.deleteAccountButton}
        </Button>
        <Button onClick={onClose}>{translations.cancelButton}</Button>
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
