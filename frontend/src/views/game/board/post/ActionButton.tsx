import type { PropsWithChildren, RefObject } from 'react';
import { Tooltip } from 'ui/tooltip';
import { cn } from 'ui/cn';

interface ActionButtonProps {
  tooltip: React.ReactElement | string | number;
  ariaLabel: string;
  icon: JSX.Element;
  disabled?: boolean;
  innerRef?: RefObject<HTMLButtonElement | null>;
  onClick: () => void;
}

export default function ActionButton({
  tooltip,
  icon,
  onClick,
  ariaLabel,
  disabled,
  innerRef,
  children,
}: PropsWithChildren<ActionButtonProps>) {
  const showTooltip = !!tooltip;
  return (
    <Tooltip content={showTooltip ? tooltip : undefined} side="bottom">
      <span className="inline-flex">
        <button
          type="button"
          onClick={onClick}
          disabled={!!disabled}
          aria-label={ariaLabel}
          tabIndex={-1}
          ref={innerRef}
          className={cn(
            'inline-flex h-8 items-center justify-center gap-1 rounded-full px-1.5 text-sm text-current hover:bg-ink/8 disabled:pointer-events-none disabled:opacity-40',
            children !== undefined ? 'min-w-12' : 'min-w-8',
          )}
        >
          {icon}
          {children !== undefined ? <span>{children}</span> : null}
        </button>
      </span>
    </Tooltip>
  );
}
