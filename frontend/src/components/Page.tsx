import type { ReactNode } from 'react';
import { cn } from 'ui/cn';

export function Page({
  children,
  className,
  wide = false,
}: {
  children: ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <main
      className={cn(
        'mx-auto w-full px-4 pt-6 pb-24 sm:px-8',
        wide ? 'max-w-none' : 'max-w-6xl',
        className,
      )}
    >
      {children}
    </main>
  );
}
