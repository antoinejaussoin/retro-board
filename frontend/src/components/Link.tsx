import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { cn } from 'ui/cn';

function Link({
  className,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { children?: ReactNode }) {
  return (
    <a
      className={cn('cursor-pointer text-primary-700 hover:underline', className)}
      {...props}
    >
      {children}
    </a>
  );
}

export default Link;
