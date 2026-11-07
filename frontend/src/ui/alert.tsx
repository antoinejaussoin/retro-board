import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

const tones = {
  info: 'border-line border-l-primary-600 bg-cream text-ink',
  success: 'border-emerald-200 border-l-emerald-600 bg-emerald-50 text-emerald-950',
  warning: 'border-amber-200 border-l-amber-500 bg-amber-50 text-amber-950',
  error: 'border-red-200 border-l-red-600 bg-red-50 text-red-950',
};

export type AlertSeverity = keyof typeof tones;

export function Alert({
  severity = 'info',
  title,
  children,
  onClose,
  className,
}: {
  severity?: AlertSeverity;
  title?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        'relative flex items-start gap-3 rounded-2xl border border-l-4 px-4 py-3 text-sm leading-6',
        tones[severity],
        className,
      )}
    >
      <div className="min-w-0 flex-1">
        {title ? <div className="font-semibold">{title}</div> : null}
        {children}
      </div>
      {onClose ? (
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="inline-flex size-7 shrink-0 items-center justify-center rounded-full hover:bg-ink/5"
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  );
}
