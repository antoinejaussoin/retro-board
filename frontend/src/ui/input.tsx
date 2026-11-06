import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react';
import { cn } from './cn';

export const fieldClass =
  'w-full rounded-xl border border-line bg-cream px-3 text-sm text-ink shadow-sm placeholder:text-muted/80 focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:opacity-50';

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input className={cn(fieldClass, 'h-10', className)} {...props} />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, 'min-h-24 py-2', className)}
      {...props}
    />
  );
}

export function Field({
  label,
  children,
  className,
}: {
  label?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn('flex w-full flex-col gap-1.5 text-sm', className)}>
      {label ? <span className="font-medium text-ink">{label}</span> : null}
      {children}
    </label>
  );
}
