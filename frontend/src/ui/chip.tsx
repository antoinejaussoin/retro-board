import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

const tones = {
  neutral: 'bg-paper text-ink',
  primary: 'bg-primary-700 text-white',
  secondary: 'bg-secondary-600 text-white',
  muted: 'bg-gray-400 text-white',
};

export function Chip({
  children,
  onDelete,
  tone = 'neutral',
  icon,
  className,
}: {
  children: ReactNode;
  onDelete?: () => void;
  tone?: keyof typeof tones;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
      {onDelete ? (
        <button
          type="button"
          aria-label="Remove"
          onClick={onDelete}
          className="rounded-full hover:bg-ink/10"
        >
          <X className="size-3" />
        </button>
      ) : null}
    </span>
  );
}
