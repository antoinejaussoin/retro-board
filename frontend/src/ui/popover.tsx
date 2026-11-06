import * as PopoverPrimitive from '@radix-ui/react-popover';
import type { ReactNode } from 'react';
import { cn } from './cn';

export const Popover = PopoverPrimitive.Root;
export const PopoverTrigger = PopoverPrimitive.Trigger;

export function PopoverContent({
  children,
  className,
  align = 'center',
}: {
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        align={align}
        sideOffset={8}
        className={cn(
          'z-50 rounded-2xl border border-line bg-cream p-3 text-ink shadow-xl outline-none animate-pop-in',
          className,
        )}
      >
        {children}
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}
