import React, { useState, useCallback } from 'react';
import GroupAddIcon from '@material-ui/icons/GroupAdd';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import Clipboard from 'react-copy-to-clipboard';
import useTranslations from '../../translations';

export default () => {
  const [isOpen, open] = useState(false);
  const toggle = useCallback(() => open(!isOpen), [open, isOpen]);
  const translations = useTranslations();
  const url = window.location.href;
  return (
    <>
      <Button>
        <GroupAddIcon onClick={toggle} style={{ color: 'white' }} />
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
};
