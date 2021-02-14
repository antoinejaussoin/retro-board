import { PropsWithChildren, useState } from 'react';
import Alert from '@material-ui/lab/Alert';
import IconButton from '@material-ui/core/IconButton';
import Collapse from '@material-ui/core/Collapse';
import CloseIcon from '@material-ui/icons/Close';
import { AlertTitle } from '@material-ui/lab';

interface TransitionAlertProps {
  title?: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
}

export default function TransitionAlert({
  title,
  severity,
  children,
}: PropsWithChildren<TransitionAlertProps>) {
  const [open, setOpen] = useState(true);

  return (
    <Collapse in={open}>
      <Alert
        severity={severity}
        action={
          <IconButton
            aria-label="close"
            color="inherit"
            size="small"
            onClick={() => {
              setOpen(false);
            }}
          >
            <CloseIcon fontSize="inherit" />
          </IconButton>
        }
      >
        {title ? <AlertTitle>{title}</AlertTitle> : null}
        {children}
      </Alert>
    </Collapse>
  );
}
