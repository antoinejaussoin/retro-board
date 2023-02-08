import React from 'react';
import PropTypes from 'prop-types';
import useToggle from '../useToggle';
import CheckBoxStyle from './checkbox.style';

const CheckBox = ({
  className,
  isChecked,
  labelText,
  value,
  id,
  htmlFor,
  labelPosition,
  isMaterial,
  disabled,
  ...props
}) => {
  // use toggle hooks
  const [toggleValue, toggleHandler] = useToggle(isChecked);

  // Add all classs to an array
  const addAllClasses = ['reusecore__checkbox'];

  // Add label position class
  if (labelPosition) {
    addAllClasses.push(`label_${labelPosition}`);
  }

  // isMaterial prop checking
  if (isMaterial) {
    addAllClasses.push('is-material');
  }

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // label control
  const LabelField = labelText && (
    <span className="reusecore__field-label">{labelText}</span>
  );

  const position = labelPosition || 'right';

  return (
    <CheckBoxStyle className={addAllClasses.join(' ')} {...props}>
      <label htmlFor={htmlFor}>
        {position === 'left' || position === 'right' ? LabelField : ''}
        <input
          type="checkbox"
          className="checkbox"
          id={id}
          value={value}
          checked={toggleValue}
          onChange={toggleHandler}
          disabled={disabled}
          {...props}
        />
        <div />
      </label>
    </CheckBoxStyle>
  );
};

CheckBox.propTypes = {
  /** ClassName of the Checkbox */
  className: PropTypes.string,

  /** labelText of the checkbox field */
  labelText: PropTypes.string,

  /**
   * Note: id and htmlFor must be same.
   */
  htmlFor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** Set checkbox id in number || string */
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** value of the checkbox field */
  value: PropTypes.string,

  /** labelText of the checkbox field */
  labelPosition: PropTypes.oneOf(['right', 'left']),

  /** Checkbox toggle state based on isChecked prop */
  isChecked: PropTypes.bool,

  /** disabled of the checkbox field */
  disabled: PropTypes.bool,
};

/** Checkbox default proptype */
CheckBox.defaultProps = {
  isChecked: false,
  labelText: 'Checkbox label',
  labelPosition: 'right',
  disabled: false,
};
export default CheckBox;
