import { cn } from 'ui/cn';

/** Shared chip look for votes and emoji reactions. */
export function reactionChipClassName({
  interactive,
}: {
  active?: boolean;
  interactive: boolean;
}): string {
  return cn(
    'retro-reaction-chip inline-flex h-8 shrink-0 items-center gap-1 rounded-full px-1.5 text-xs text-ink transition-colors',
    interactive ? null : 'cursor-default opacity-80',
  );
}

export const reactionEmojiClassName = 'text-base leading-none';
