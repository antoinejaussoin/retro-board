import styled from 'styled-components';
import { themeGet } from '@styled-system/theme-get';

const InputField = styled.div`
  position: relative;

  /* Input field wrapper */
  .field-wrapper {
    position: relative;
  }

  /* If input has icon then these styel */
  &.icon-left,
  &.icon-right {
    .field-wrapper {
      display: flex;
      align-items: center;
      > .input-icon {
        position: absolute;
        top: 0;
        bottom: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 34px;
        height: 40px;
      }
    }
  }

  /* When icon position in left */
  &.icon-left {
    .field-wrapper {
      > .input-icon {
        left: 0;
        right: auto;
      }
      > input {
        padding-left: 34px;
      }
    }
  }

  /* When icon position in right */
  &.icon-right {
    .field-wrapper {
      > .input-icon {
        left: auto;
        right: 0;
      }
      > input {
        padding-right: 34px;
      }
    }
  }

  /* Label default style */
  label {
    display: block;
    color: ${themeGet('colors.labelColor', '#767676')};
    font-size: ${themeGet('fontSizes.4', '16')}px;
    font-weight: ${themeGet('fontWeights.4', '500')};
    margin-bottom: ${themeGet('space.3', '10')}px;
    transition: 0.2s ease all;
  }

  /* Input and textarea default style */
  textarea,
  input {
    font-size: 16px;
    padding: 11px;
    display: block;
    width: 100%;
    color: ${themeGet('colors.textColor', '#484848')};
    box-shadow: none;
    border-radius: 4px;
    box-sizing: border-box;
    border: 1px solid ${themeGet('colors.inactiveIcon', '#ebebeb')};
    transition: border-color 0.2s ease;
    &:focus {
      outline: none;
      border-color: ${themeGet('colors.primary', '#028489')};
    }
  }

  textarea {
    min-height: 150px;
  }

  /* Input material style */
  &.is-material {
    label {
      position: absolute;
      left: 0;
      top: 10px;
    }

    input,
    textarea {
      border-radius: 0;
      border-top: 0;
      border-left: 0;
      border-right: 0;
      padding-left: 0;
      padding-right: 0;
    }

    textarea {
      min-height: 40px;
      padding-bottom: 0;
    }

    .highlight {
      position: absolute;
      height: 1px;
      top: auto;
      left: 50%;
      bottom: 0;
      width: 0;
      pointer-events: none;
      transition: all 0.2s ease;
    }

    /* If input has icon then these styel */
    &.icon-left,
    &.icon-right {
      .field-wrapper {
        flex-direction: row-reverse;
        > .input-icon {
          width: auto;
        }
        > input {
          flex: 1;
        }
      }
    }

    /* When icon position in left */
    &.icon-left {
      .field-wrapper {
        > input {
          padding-left: 20px;
        }
      }
      label {
        top: -15px;
        font-size: 12px;
      }
    }

    /* When icon position in right */
    &.icon-right {
      .field-wrapper {
        > input {
          padding-right: 20px;
        }
      }
    }

    /* Material input focus style */
    &.is-focus {
      input {
        border-color: ${themeGet('colors.inactiveIcon', '#ebebeb')};
      }

      label {
        top: -16px;
        font-size: 12px;
        color: ${themeGet('colors.textColor', '#484848')};
      }

      .highlight {
        width: 100%;
        height: 2px;
        background-color: ${themeGet('colors.primary', '#028489')};
        left: 0;
      }
    }
  }
`;

const EyeButton = styled.button`
  width: 43px;
  height: 40px;
  border: 0;
  padding: 0;
  margin: 0;
  top: 0;
  right: 0;
  position: absolute;
  outline: none;
  cursor: pointer;
  box-shadow: none;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: transparent;

  > span {
    width: 12px;
    height: 12px;
    display: block;
    border: solid 1px ${themeGet('colors.textColor', '#484848')};
    border-radius: 75% 15%;
    transform: rotate(45deg);
    position: relative;

    &:before {
      content: '';
      display: block;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      left: 3px;
      top: 3px;
      position: absolute;
      border: solid 1px ${themeGet('colors.textColor', '#484848')};
    }
  }

  &.eye-closed {
    > span {
      &:after {
        content: '';
        display: block;
        width: 1px;
        height: 20px;
        left: calc(50% - 1px / 2);
        top: -4px;
        position: absolute;
        background-color: ${themeGet('colors.textColor', '#484848')};
        transform: rotate(-12deg);
      }
    }
  }
`;

export { EyeButton };

export default InputField;
