import { useState, type PropsWithChildren } from 'react';
import { Alert, type AlertSeverity } from 'ui/alert';

interface TransitionAlertProps {
  title?: string;
  severity?: AlertSeverity;
  className?: string;
}

export default function TransitionAlert({
  title,
  severity,
  className,
  children,
}: PropsWithChildren<TransitionAlertProps>) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return null;
  }
  return (
    <Alert
      severity={severity}
      title={title}
      className={className}
      onClose={() => setOpen(false)}
    >
      {children}
    </Alert>
  );
}
