import { ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { Button } from 'ui/button';
import { Menu, MenuContent, MenuTrigger } from 'ui/menu';
import { cn } from 'ui/cn';

type SplitButtonProps = {
  label?: string;
  children?: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  secondary?: boolean;
  large?: boolean;
  onClick: () => void;
};

export default function SplitButton({
  label,
  icon,
  large,
  disabled,
  secondary,
  children,
  onClick,
  ...props
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="inline-flex">
      <Button
        disabled={disabled}
        onClick={onClick}
        variant={secondary ? 'secondary' : 'primary'}
        size={large ? 'lg' : 'md'}
        className="rounded-r-none"
        {...props}
      >
        {icon}
        {label}
      </Button>
      <Menu>
        <MenuTrigger>
          <button
            type="button"
            disabled={disabled}
            aria-label="select other options"
            aria-expanded={open}
            aria-haspopup="menu"
            onClick={() => setOpen((value) => !value)}
            className={cn(
              'inline-flex items-center rounded-r-full border-l border-white/20 px-2 text-white disabled:opacity-40',
              secondary ? 'bg-secondary-600 hover:bg-secondary-700' : 'bg-primary-700 hover:bg-primary-800',
              large ? 'h-12' : 'h-10',
            )}
          >
            <ChevronDown className="size-4" />
          </button>
        </MenuTrigger>
        <MenuContent align="start" className="min-w-64">
          {children}
        </MenuContent>
      </Menu>
    </div>
  );
}
