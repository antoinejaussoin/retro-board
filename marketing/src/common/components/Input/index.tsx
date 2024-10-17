import React, { useState } from 'react';
import PropTypes from 'prop-types';
import InputField, { EyeButton } from './input.style';

type InputProps = {
  label?: string;
  value?: string | number;
  onBlur?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onFocus?: (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onChange?: (value: string | number) => void;
  inputType?: 'text' | 'email' | 'password' | 'number' | 'textarea';
  isMaterial?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  passwordShowHide?: boolean;
  className?: string;
  placeholder?: string;
};

const Input = ({
  label,
  value,
  onBlur,
  onFocus,
  onChange,
  inputType,
  isMaterial,
  icon,
  iconPosition,
  passwordShowHide,
  className,
  ...props
}: InputProps) => {
  // use toggle hooks
  const [state, setState] = useState({
    toggle: false,
    focus: false,
    value: '',
  });

  // toggle function
  const handleToggle = () => {
    setState({
      ...state,
      toggle: !state.toggle,
    });
  };

  // add focus class
  const handleOnFocus = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setState({
      ...state,
      focus: true,
    });
    if (onFocus) {
      onFocus(event);
    }
  };

  // remove focus class
  const handleOnBlur = (
    event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setState({
      ...state,
      focus: false,
    });
    if (onBlur) {
      onBlur(event);
    }
  };

  // handle input value
  const handleOnChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setState({
      ...state,
      value: event.target.value,
    });
    if (onChange) {
      onChange(event.target.value);
    }
  };

  // get input focus class
  const getInputFocusClass = () => {
    if (state.focus === true || state.value !== '') {
      return 'is-focus';
    } else {
      return '';
    }
  };

  // init variable
  let inputElement, htmlFor;

  // Add all classs to an array
  const addAllClasses = ['reusecore__input'];

  // Add is-material class
  if (isMaterial) {
    addAllClasses.push('is-material');
  }

  // Add icon position class if input element has icon
  if (icon && iconPosition) {
    addAllClasses.push(`icon-${iconPosition}`);
  }

  // Add new class
  if (className) {
    addAllClasses.push(className);
  }

  // if lable is not empty
  if (label) {
    htmlFor = label.replace(/\s+/g, '_').toLowerCase();
  }

  // Label position
  const LabelPosition = isMaterial === true ? 'bottom' : 'top';

  // Label field
  const LabelField = label && <label htmlFor={htmlFor}>{label}</label>;

  // Input type check
  switch (inputType) {
    case 'textarea':
      inputElement = (
        <textarea
          {...props}
          id={htmlFor}
          name={htmlFor}
          value={state.value}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          onFocus={handleOnFocus}
        />
      );
      break;

    case 'password':
      inputElement = (
        <div className="field-wrapper">
          <input
            {...props}
            id={htmlFor}
            name={htmlFor}
            type={state.toggle ? 'password' : 'text'}
            value={state.value}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
          />
          {passwordShowHide && (
            <EyeButton
              onClick={handleToggle}
              className={state.toggle ? 'eye' : 'eye-closed'}
            >
              <span />
            </EyeButton>
          )}
        </div>
      );
      break;

    default:
      inputElement = (
        <div className="field-wrapper">
          <input
            {...props}
            id={htmlFor}
            name={htmlFor}
            type={inputType}
            value={state.value}
            onChange={handleOnChange}
            onBlur={handleOnBlur}
            onFocus={handleOnFocus}
          />
          {icon && <span className="input-icon">{icon}</span>}
        </div>
      );
  }

  return (
    <InputField
      className={`${addAllClasses.join(' ')} ${getInputFocusClass()}`}
    >
      {LabelPosition === 'top' && LabelField}
      {inputElement}
      {isMaterial && <span className="highlight" />}
      {LabelPosition === 'bottom' && LabelField}
    </InputField>
  );
};

/** Inout prop type checking. */
Input.propTypes = {
  /** className of the Input component. */
  className: PropTypes.string,

  /** Set input label value. */
  label: PropTypes.string,

  /** The input value, required for a controlled component. */
  value: PropTypes.oneOf(['string', 'number']),

  /** Make default input into material style input. */
  isMaterial: PropTypes.bool,

  /** Password show hide icon button prop [*only for password field]. */
  passwordShowHide: PropTypes.bool,

  /** Set input type of the input element. Default type is text. */
  inputType: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'textarea',
  ]),

  /** Add icon in input field. This prop will not work with password
   * and textarea field.
   */
  icon: PropTypes.object,

  /** Set input field icon position. Default position is 'left'. */
  iconPosition: PropTypes.oneOf(['left', 'right']),

  /**
   * @ignore
   */
  onBlur: PropTypes.func,

  /**
   * @ignore
   */
  onFocus: PropTypes.func,

  /**
   * Callback fired when the value is changed.
   *
   * @param {object} event The event source of the callback.
   * You can pull out the new value by accessing `event.target.value`.
   */
  onChange: PropTypes.func,
};

/** Inout default type. */
Input.defaultProps = {
  inputType: 'text',
  isMaterial: false,
  iconPosition: 'left',
  onBlur: () => {},
  onFocus: () => {},
  onChange: () => {},
};

export default Input;
