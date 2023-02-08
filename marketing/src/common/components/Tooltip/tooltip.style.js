import styled from 'styled-components';
import {
  fontSize,
  fontWeight,
  boxShadow,
  color,
  space,
  borderRadius,
  width,
  maxWidth,
  minWidth,
  height,
  maxHeight,
  minHeight,
} from 'styled-system';

const TooltipStyle = styled.span`
  /* Tooltip default style */
  position: relative;

  .tooltip-top,
  .tooltip-bottom {
    left: 50%;
    transform: translateX(-50%);

    &::after {
      left: 50%;
      transform: translateX(-50%);
      border-left: 9px solid transparent;
      border-right: 9px solid transparent;
    }
  }

  .tooltip-top {
    bottom: 100%;
    padding-bottom: 9px;

    &::after {
      border-top: 9px solid
        ${(props) => (props.tooltipColor ? props.tooltipColor : '#131212')};
      bottom: 0;
    }
  }

  .tooltip-bottom {
    top: 100%;
    padding-top: 9px;

    &::after {
      border-bottom: 9px solid
        ${(props) => (props.tooltipColor ? props.tooltipColor : '#131212')};
      top: 0;
    }
  }

  .tooltip-left,
  .tooltip-right {
    top: 50%;
    transform: translateY(-50%);

    &::after {
      top: 50%;
      transform: translateY(-50%);
      border-top: 9px solid transparent;
      border-bottom: 9px solid transparent;
    }
  }

  .tooltip-left {
    right: 100%;
    padding-right: 9px;

    &::after {
      border-left: 9px solid
        ${(props) => (props.tooltipColor ? props.tooltipColor : '#131212')};
      right: 0;
    }
  }

  .tooltip-right {
    left: 100%;
    padding-left: 9px;

    &::after {
      border-right: 9px solid
        ${(props) => (props.tooltipColor ? props.tooltipColor : '#131212')};
      left: 0;
    }
  }
`;

const TriggerStyle = styled.span`
  display: inline-block;
  font-weight: 700;
  ${fontSize}
  ${fontWeight}
  ${color}
  ${space}
`;

const BubbleSize = styled.div`
  min-width: 120px;
  max-width: 210px;
  position: absolute;
  z-index: 10;
  &::after {
    content: '';
    position: absolute;
  }
  ${minWidth}
  ${maxWidth}
  ${width}
  ${minHeight}
  ${maxHeight}
  ${height}
`;

const BubbleStyle = styled.div`
  background-color: ${(props) =>
    props.tooltipColor ? props.tooltipColor : '#131212'};
  border-radius: 3px;
  color: #ffffff;
  font-size: 12px;
  line-height: 15px;
  padding: 0.75em;
  text-align: center;

  /* Style system custom style */
  ${boxShadow}
  ${fontSize}
  ${color}
  ${borderRadius}
`;

TooltipStyle.displayName = 'TooltipStyle';

export { TooltipStyle, TriggerStyle, BubbleSize, BubbleStyle };
