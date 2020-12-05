import React from 'react';
import { Tooltip, Button } from '@material-ui/core';
import styled from 'styled-components';

interface ActionButtonProps {
  tooltip: React.ReactElement | string | number;
  ariaLabel: string;
  icon: JSX.Element;
  disabled?: boolean;
  innerRef?: React.RefObject<HTMLButtonElement>;
  onClick: () => void;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  tooltip,
  icon,
  onClick,
  ariaLabel,
  disabled,
  innerRef,
  children,
}) => {
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
        <SmallerButton
          onClick={onClick}
          disabled={!!disabled}
          aria-label={ariaLabel}
          tabIndex={-1}
          innerRef={innerRef}
          large={children !== undefined}
          style={{
            position: 'relative',
            paddingLeft: 0,
            paddingRight: 0,
          }}
        >
          {icon}
          {children !== undefined ? <>&nbsp;{children}</> : null}
        </SmallerButton>
      </span>
    </Tooltip>
  );
};

const SmallerButton = styled(Button)<{ large: boolean }>`
  min-width: ${(props) => (props.large ? 64 : 42)}px;
`;

export default ActionButton;
