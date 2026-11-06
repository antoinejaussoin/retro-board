import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import type { ButtonHTMLAttributes } from 'react';
import { cn } from './cn';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500',
  {
    variants: {
      variant: {
        primary: 'bg-primary-700 text-white hover:bg-primary-800',
        secondary: 'bg-secondary-600 text-white hover:bg-secondary-700',
        outline:
          'border border-line-strong bg-cream text-ink hover:border-primary-300 hover:bg-paper',
        ghost: 'text-ink hover:bg-ink/5',
        danger: 'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
