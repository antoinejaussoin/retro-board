import type { ReactElement } from 'react';
import { Alert } from 'ui/alert';
import { cn } from 'ui/cn';

type OptionItemProps = {
  children: ReactElement;
  help: string;
  label: string;
  wide?: boolean;
};

export function OptionItem({
  label,
  help,
  children,
  wide = false,
}: OptionItemProps) {
  return (
    <div className="my-3 overflow-hidden rounded-2xl border border-line bg-cream">
      <div
        className={cn(
          'flex min-h-12 items-center gap-4 px-4 py-2',
          wide && 'max-[600px]:flex-col max-[600px]:items-stretch',
        )}
      >
        <div
          className={cn(
            'flex min-h-8 items-center text-sm font-medium',
            wide ? 'max-[600px]:mt-1' : 'flex-1',
          )}
        >
          {label}
        </div>
        <div className={cn(wide ? 'w-full min-w-0 flex-1' : 'shrink-0')}>
          {children}
        </div>
      </div>
      <Alert severity="info" className="rounded-none border-x-0 border-b-0">
        {help}
      </Alert>
    </div>
  );
}
