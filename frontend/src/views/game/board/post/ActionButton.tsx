import Tooltip from '@mui/material/Tooltip';
import Button from '@mui/material/Button';
import { PropsWithChildren } from 'react';

interface ActionButtonProps {
  tooltip: React.ReactElement | string | number;
  ariaLabel: string;
  icon: JSX.Element;
  disabled?: boolean;
  innerRef?: React.RefObject<HTMLButtonElement>;
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
    <Tooltip
      placement="bottom"
      disableHoverListener={!showTooltip}
      disableFocusListener={!showTooltip}
      disableTouchListener={!showTooltip}
      title={tooltip}
    >
      <span>
        <Button
          onClick={onClick}
          disabled={!!disabled}
          aria-label={ariaLabel}
          tabIndex={-1}
          ref={innerRef}
          color="inherit"
          style={{
            position: 'relative',
            paddingLeft: 0,
            paddingRight: 0,
            minWidth: children !== undefined ? 64 : 42,
          }}
        >
          {icon}
          {children !== undefined ? <>&nbsp;{children}</> : null}
        </Button>
      </span>
    </Tooltip>
  );
}
