import type { PropsWithChildren } from 'react';
import { cn } from 'ui/cn';

interface SectionProps {
  title?: string;
  danger?: boolean;
}

export default function Section({
  title,
  danger,
  children,
}: PropsWithChildren<SectionProps>) {
  return (
    <section
      className={cn(
        'flex flex-col gap-4 rounded-3xl border bg-cream p-6',
        danger ? 'border-red-500' : 'border-line',
      )}
    >
      {title ? (
        <h2
          className={cn(
            'text-2xl font-medium tracking-tight',
            danger && 'text-red-600',
          )}
        >
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
