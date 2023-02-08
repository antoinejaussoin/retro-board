import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  TooltipStyle,
  TriggerStyle,
  BubbleSize,
  BubbleStyle,
} from './tooltip.style';

const Tooltip = ({
  className,
  position,
  tooltipColor,
  bubbleSize,
  bubbleStyle,
  triggerStyle,
  message,
  children,
  ...props
}) => {
  // tooltip local state
  const [state, setState] = useState({
    open: false,
  });

  // Add all classs to an array
  const addAllClasses = ['reusecore__tooltip'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // hide tooltip on mouse leave
  const hideTooltip = () => {
    setState({ open: false });
  };

  // show tooltip on mouse over
  const showTooltip = () => {
    setState({ open: true });
  };

  return (
    <TooltipStyle
      className={addAllClasses.join(' ')}
      onMouseLeave={hideTooltip}
      tooltipColor={tooltipColor}
      {...props}
    >
      {state.open && (
        <BubbleSize
          className={`tooltip-bubble tooltip-${position}`}
          {...bubbleSize}
        >
          <BubbleStyle className="tooltip-message" {...bubbleStyle}>
            {message}
          </BubbleStyle>
        </BubbleSize>
      )}
      <TriggerStyle
        className="tooltip-trigger"
        onMouseOver={showTooltip}
        {...triggerStyle}
      >
        {children}
      </TriggerStyle>
    </TooltipStyle>
  );
};

Tooltip.propTypes = {
  /** ClassName of the Tooltip */
  className: PropTypes.string,

  /** Change tooltip tooltipColor */
  tooltipColor: PropTypes.string,

  /** triggerStyle prop allow to change tooltip trigger fontSize, fontWeight, margin, padding, color and bg color.*/
  triggerStyle: PropTypes.object,

  /** bubbleSize prop allow to change tooltip's buble width including min and max width.
   * And height including min and max height */
  BubbleSize: PropTypes.object,

  /** bubbleStyle prop allow to change tooltip's buble boxShadow, color, fontSize, borderRadius */
  bubbleStyle: PropTypes.object,

  /** Set tooltip position left || right || top || bottom. */
  position: PropTypes.oneOf(['left', 'right', 'top', 'bottom']),
};

/** Tooltip default proptype */
Tooltip.defaultProps = {
  isChecked: false,
};

export default Tooltip;
