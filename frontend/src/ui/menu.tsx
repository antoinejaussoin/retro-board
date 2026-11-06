import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { cn } from './cn';

export function Menu({ children }: { children: ReactNode }) {
  return <DropdownMenu.Root>{children}</DropdownMenu.Root>;
}

export function MenuTrigger({ children }: { children: ReactNode }) {
  return <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>;
}

export function MenuContent({
  children,
  align = 'end',
  className,
}: {
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  className?: string;
}) {
  return (
    <DropdownMenu.Portal>
      <DropdownMenu.Content
        align={align}
        sideOffset={8}
        className={cn(
          'z-50 min-w-48 overflow-hidden rounded-2xl border border-line bg-cream p-1 text-sm text-ink shadow-xl animate-pop-in',
          className,
        )}
      >
        {children}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  );
}

export function MenuItem({
  children,
  onSelect,
  disabled,
  className,
  ...props
}: {
  children: ReactNode;
  onSelect?: () => void;
  disabled?: boolean;
  className?: string;
} & Omit<DropdownMenu.DropdownMenuItemProps, 'onSelect'>) {
  return (
    <DropdownMenu.Item
      disabled={disabled}
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 outline-none data-[disabled]:pointer-events-none data-[disabled]:opacity-40 data-[highlighted]:bg-paper',
        className,
      )}
      onSelect={() => onSelect?.()}
      {...props}
    >
      {children}
    </DropdownMenu.Item>
  );
}

export function MenuLabel({ children }: { children: ReactNode }) {
  return (
    <DropdownMenu.Label className="px-3 py-1.5 text-xs font-medium tracking-wide text-muted uppercase">
      {children}
    </DropdownMenu.Label>
  );
}

export function MenuSeparator() {
  return <DropdownMenu.Separator className="my-1 h-px bg-line" />;
}
