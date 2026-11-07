import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from './cn';

export function Checkbox({
  checked,
  onCheckedChange,
  label,
  className,
  id,
}: {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <label className={cn('inline-flex items-center gap-2 text-sm', className)}>
      <CheckboxPrimitive.Root
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange?.(value === true)}
        className="flex size-4 items-center justify-center rounded border border-line-strong bg-cream text-white data-[state=checked]:border-primary-700 data-[state=checked]:bg-primary-700"
      >
        <CheckboxPrimitive.Indicator>
          <Check className="size-3" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
      {label}
    </label>
  );
}
