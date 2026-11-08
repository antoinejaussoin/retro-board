import { cn } from 'ui/cn';

/** Shared chip look for votes and emoji reactions. */
export function reactionChipClassName({
  active,
  interactive,
}: {
  active: boolean;
  interactive: boolean;
}): string {
  return cn(
    'inline-flex h-7 shrink-0 items-center gap-0.5 rounded-full border border-line px-1.5 text-xs text-ink transition-colors',
    active ? 'bg-ink/8' : 'bg-paper',
    interactive
      ? active
        ? 'hover:bg-ink/12'
        : 'hover:bg-ink/5'
      : 'cursor-default opacity-80',
    !interactive && active && 'opacity-100',
  );
}
