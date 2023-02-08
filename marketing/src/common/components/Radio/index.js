import React from 'react';
import PropTypes from 'prop-types';
import { useToggle } from '../useToggle';
import RadioBoxStyle from './radio.style';

const Radio = ({
  className,
  isChecked,
  labelText,
  value,
  id,
  htmlFor,
  isMaterial,
  labelPosition,
  disabled,
  ...props
}) => {
  // use toggle hooks
  const [toggleValue, toggleHandler] = useToggle(isChecked);

  // Add all classs to an array
  const addAllClasses = ['reusecore__radio'];

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

  const position = labelPosition || 'right';

  // label control
  const LabelField = labelText && (
    <span className="reusecore__field-label">{labelText}</span>
  );

  return (
    <RadioBoxStyle className={addAllClasses.join(' ')} {...props}>
      <label>
        {position === 'left' || position === 'right' ? LabelField : ''}
        <input
          type="radio"
          className="radio"
          id={id}
          value={value}
          checked={toggleValue}
          onChange={toggleHandler}
          disabled={disabled}
          {...props}
        />
        <div />
      </label>
    </RadioBoxStyle>
  );
};

Radio.propTypes = {
  /** ClassName of the radio */
  className: PropTypes.string,

  /** labelText of the radio field */
  labelText: PropTypes.string,

  /**
   * Note: id and htmlFor must be same.
   */
  htmlFor: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** Set radio id in number || string */
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

  /** value of the radio field */
  value: PropTypes.string,

  /** labelText of the radio field */
  labelPosition: PropTypes.oneOf(['right', 'left']),

  /** radio toggle state based on isChecked prop */
  isChecked: PropTypes.bool,

  /** disabled of the radio field */
  disabled: PropTypes.bool,
};

/** Radio default proptype */
Radio.defaultProps = {
  isChecked: false,
  labelText: 'Radio label',
  labelPosition: 'right',
  disabled: false,
};
export default Radio;
