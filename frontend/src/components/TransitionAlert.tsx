import { PropsWithChildren, useState } from 'react';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Collapse from '@mui/material/Collapse';
import CloseIcon from '@mui/icons-material/Close';
import { AlertTitle } from '@mui/material';

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
