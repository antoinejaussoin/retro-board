import type { ReactNode } from 'react';
import { cn } from './cn';

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  'aria-label': ariaLabel,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: ReactNode }[];
  className?: string;
  'aria-label'?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'inline-flex rounded-full bg-paper p-1 text-sm',
        className,
      )}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors',
              selected
                ? 'bg-cream text-primary-800 shadow-sm'
                : 'text-muted hover:text-ink',
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
