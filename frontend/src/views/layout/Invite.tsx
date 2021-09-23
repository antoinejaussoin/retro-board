import { useState, useCallback } from 'react';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import Clipboard from 'react-copy-to-clipboard';
import useTranslations from '../../translations';

export default function Invite() {
  const [isOpen, open] = useState(false);
  const toggle = useCallback(() => open(!isOpen), [open, isOpen]);
  const translations = useTranslations();
  const url = window.location.href;
  return (
    <>
      <Button onClick={toggle}>
        <GroupAddIcon style={{ color: 'white' }} />
      </Button>
      <Dialog open={isOpen} onClose={toggle}>
        <DialogTitle>{translations.Invite.dialog.title}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {translations.Invite.dialog.text}:
          </DialogContentText>
          <DialogContentText
            color="secondary"
            style={{ marginTop: 10, marginBottom: 10 }}
          >
            {url}
          </DialogContentText>
          <DialogContentText>
            <Clipboard text={url}>
              <Button variant="text" color="primary">
                <FileCopyIcon />
                &nbsp;&nbsp;
                {translations.Invite.dialog.copyButton}
              </Button>
            </Clipboard>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={toggle}>{translations.Generic.ok}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
