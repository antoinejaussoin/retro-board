import { cn } from './cn';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn(
        'inline-block size-8 animate-spin rounded-full border-2 border-primary-200 border-t-primary-700',
        className,
      )}
    />
  );
}
