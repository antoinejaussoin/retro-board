import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-3xl',
  xl: 'max-w-5xl',
};

export function Dialog({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
    >
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({
  children,
  className,
  size = 'md',
  fullScreen = false,
  hideClose = false,
}: {
  children: ReactNode;
  className?: string;
  size?: keyof typeof sizes;
  fullScreen?: boolean;
  hideClose?: boolean;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/40 animate-fade-in" />
      <DialogPrimitive.Content
        className={cn(
          'fixed z-50 flex flex-col bg-cream text-ink shadow-2xl outline-none animate-pop-in',
          fullScreen
            ? 'inset-0 h-dvh w-screen rounded-none'
            : cn(
                'top-1/2 left-1/2 max-h-[min(90dvh,880px)] w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-3xl border border-line',
                sizes[size],
              ),
          className,
        )}
      >
        {children}
        {hideClose ? null : (
          <DialogPrimitive.Close className="absolute top-3 right-3 inline-flex size-8 items-center justify-center rounded-full text-muted hover:bg-ink/5 hover:text-ink">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogTitle({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Title
      className={cn(
        'px-6 pt-6 pr-12 text-xl font-medium tracking-tight',
        className,
      )}
    >
      {children}
    </DialogPrimitive.Title>
  );
}

export function DialogDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Description
      className={cn('px-6 pt-2 text-sm leading-6 text-muted', className)}
    >
      {children}
    </DialogPrimitive.Description>
  );
}

export function DialogBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-h-0 flex-1 overflow-y-auto px-6 py-4', className)}>
      {children}
    </div>
  );
}

export function DialogFooter({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-2 border-t border-line px-6 py-4',
        className,
      )}
    >
      {children}
    </div>
  );
}
