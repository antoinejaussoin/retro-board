import { Alert, AlertColor, AlertTitle } from '@mui/material';
import { useState } from 'react';

type ClosableAlertProps = {
  title?: React.ReactNode;
  children: React.ReactNode;
  severity: AlertColor;
  closable?: boolean;
};

export default function ClosableAlert({
  title,
  children,
  severity,
  closable,
}: ClosableAlertProps) {
  const [open, setOpen] = useState(true);

  if (!open) return null;

  return (
    <Alert
      severity={severity}
      onClose={closable ? () => setOpen(false) : undefined}
    >
      <AlertTitle>{title}</AlertTitle>
      {children}
    </Alert>
  );
}
