import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

export function IconButton({
  className,
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={cn(
        'inline-flex size-10 items-center justify-center rounded-full text-current transition-colors hover:bg-ink/8 disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
        className,
      )}
      {...props}
    />
  );
}
