import { X } from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { Alert, type AlertSeverity } from 'ui/alert';

interface TransitionAlertProps {
  title?: string;
  severity?: AlertSeverity;
}

export default function TransitionAlert({
  title,
  severity,
  children,
}: PropsWithChildren<TransitionAlertProps>) {
  const [open, setOpen] = useState(true);
  if (!open) {
    return null;
  }
  return (
    <Alert severity={severity} title={title}>
      <div className="flex items-start justify-between gap-3">
        <div>{children}</div>
        <button
          type="button"
          aria-label="close"
          onClick={() => setOpen(false)}
          className="rounded-full p-1 hover:bg-ink/5"
        >
          <X className="size-4" />
        </button>
      </div>
    </Alert>
  );
}
