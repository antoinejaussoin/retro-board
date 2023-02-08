import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';
import { lightenColor } from '../lightenDarken';
import { base } from '../base';

const SwitchStyle = styled.div`
  /* Switch default style */
  display: inline-flex;

  /* Switch label default style */
  .reusecore__field-label {
    color: ${themeGet('colors.labelColor', '#767676')};
    font-size: ${themeGet('fontSizes.4', '16')}px;
    font-weight: ${themeGet('fontWeights.4', '500')};
  }

  /* Switch label style when labelPosition on left */
  &.label_left {
    label {
      display: flex;
      align-items: center;
      .reusecore__field-label {
        margin-right: ${themeGet('space.3', '10')}px;
      }
    }
  }

  /* Switch label style when labelPosition on right */
  &.label_right {
    label {
      display: flex;
      flex-direction: row-reverse;
      align-items: center;

      .reusecore__field-label {
        margin-left: ${themeGet('space.3', '10')}px;
      }
    }
  }

  /* Switch label style when labelPosition on top || bottom */
  &.label_top {
    label {
      .reusecore__field-label {
        display: flex;
        margin-bottom: ${themeGet('space.2', '8')}px;
      }
    }
  }
  &.label_bottom {
    label {
      .reusecore__field-label {
        display: flex;
        margin-top: ${themeGet('space.2', '8')}px;
      }
    }
  }

  /* Switch default style goes here */
  input[type='checkbox'] {
    &.switch {
      opacity: 0;
      position: absolute;
      margin: 0;
      z-index: -1;
      width: 0;
      height: 0;
      overflow: hidden;
      left: 0;
      pointer-events: none;

      &:checked + div {
        width: ${(props) => (props.switchSize ? props.switchSize : '80px')};
        background-position: 0 0;
        background-color: ${(props) =>
          props.switchColor ? props.switchColor : '#028489'};
        > div {
          background-color: ${themeGet('colors.white', '#ffffff')};
          left: calc(
            ${(props) => (props.switchSize ? props.switchSize : '80px')} / 2 +
              3px
          );
        }
      }
    }
    + div {
      vertical-align: middle;
      width: ${(props) => (props.switchSize ? props.switchSize : '80px')};
      height: calc(
        ${(props) => (props.switchSize ? props.switchSize : '80px')} / 2
      );
      border-radius: 450px;
      border-width: 2px;
      border-style: solid;
      border-color: ${(props) =>
        props.switchColor ? props.switchColor : '#028489'};
      transition-duration: 0.4s;
      transition-property: background-color, box-shadow;
      cursor: pointer;
      box-sizing: border-box;
      position: relative;

      > div {
        float: left;
        width: calc(
          ${(props) => (props.switchSize ? props.switchSize : '80px')} / 2 - 8px
        );
        height: calc(
          ${(props) => (props.switchSize ? props.switchSize : '80px')} / 2 - 8px
        );
        border-radius: 50%;
        pointer-events: none;
        top: 2px;
        left: 2px;
        position: absolute;
        background-color: ${(props) =>
          props.switchColor ? props.switchColor : '#028489'};
        transition-timing-function: cubic-bezier(1, 0, 0, 1);
        transition-duration: 0.4s;
        transition-property: left, background-color;
      }
    }
  }

  /* Material style goes here */
  &.is-material {
    /* Switch label style when labelPosition on top || bottom */
    &.label_top {
      label {
        .reusecore__field-label {
          margin-bottom: ${themeGet('space.3', '10')}px;
        }
      }
    }
    &.label_bottom {
      label {
        .reusecore__field-label {
          margin-top: ${themeGet('space.3', '10')}px;
        }
      }
    }

    /* Material switch default style */
    input[type='checkbox'] {
      &.switch {
        &:checked + div {
          width: ${(props) => (props.switchSize ? props.switchSize : '50px')};
          background-color: ${(props) =>
            props.switchColor
              ? lightenColor(props.switchColor, 0.2)
              : lightenColor('#028489', 0.2)};
          > div {
            background-color: ${(props) =>
              props.switchColor ? props.switchColor : '#028489'};
            left: calc(
              ${(props) => (props.switchSize ? props.switchSize : '50px')} -
                ${(props) => (props.switchSize ? props.switchSize : '50px')} / 2 +
                1px
            );
          }
        }
      }
      + div {
        width: ${(props) => (props.switchSize ? props.switchSize : '50px')};
        height: calc(
          ${(props) => (props.switchSize ? props.switchSize : '50px')} / 4
        );
        border-width: 0;
        background-color: ${(props) =>
          props.barColor ? props.barColor : '#a0a0a0'};

        > div {
          width: calc(
            ${(props) => (props.switchSize ? props.switchSize : '50px')} / 2
          );
          height: calc(
            ${(props) => (props.switchSize ? props.switchSize : '50px')} / 2
          );
          top: calc(
            -${(props) => (props.switchSize ? props.switchSize : '50px')} / 8
          );
          left: 0;
          background-color: ${themeGet('colors.white', '#ffffff')};
          box-shadow: 0px 1px 5px 0px rgba(0, 0, 0, 0.2),
            0px 2px 2px 0px rgba(0, 0, 0, 0.14),
            0px 3px 1px -2px rgba(0, 0, 0, 0.12);
        }
      }
    }
  }

  ${base}
`;

// prop types can also be added from the style functions
SwitchStyle.propTypes = {};

SwitchStyle.displayName = 'SwitchStyle';

export default SwitchStyle;
