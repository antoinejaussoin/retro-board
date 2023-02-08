/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import useToggle from '../useToggle';
import SwitchStyle from './switch.style';

const Switch = ({
  className,
  switchColor,
  isChecked,
  labelText,
  labelPosition,
  switchSize,
  isMaterial,
  barColor,
  onChange,
  onFocus,
  onBlur,
  handleOnChange,
  ...props
}) => {
  // use toggle hooks
  const [toggleValue, toggleHandler] = useToggle(isChecked);

  // Add all classs to an array
  const addAllClasses = ['reusecore__switch'];

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

  handleOnChange = (event) => {
    toggleHandler();
    onChange(!toggleValue);
  };

  const LabelField = labelText && (
    <span className="reusecore__field-label">{labelText}</span>
  );

  const position = labelPosition || 'top';

  return (
    <SwitchStyle
      className={addAllClasses.join(' ')}
      switchColor={switchColor}
      switchSize={switchSize}
      barColor={barColor}
      {...props}
    >
      <label>
        {position === 'left' || position === 'right' || position === 'top'
          ? LabelField
          : ''}

        <input
          checked={toggleValue}
          onChange={handleOnChange}
          onBlur={onBlur}
          onFocus={onFocus}
          className="switch"
          type="checkbox"
          value={toggleValue}
        />
        <div>
          <div />
        </div>
        {position === 'bottom' && LabelField}
      </label>
    </SwitchStyle>
  );
};

Switch.propTypes = {
  /** ClassName of the Switch */
  className: PropTypes.string,

  /** Add Material effect */
  isMaterial: PropTypes.bool,

  /** labelText of the switch field */
  labelText: PropTypes.string,

  /** switchSize control switch width and height */
  switchSize: PropTypes.string,

  /** Set label position of the switch field */
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),

  /** Switch toggle state based on isChecked prop */
  isChecked: PropTypes.bool,

  /** Set color for Switch */
  SwitchColor: PropTypes.string,

  /** Set material bar color for Switch */
  barColor: PropTypes.string,

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

Switch.defaultProps = {
  isChecked: false,
  labelPosition: 'top',
  onBlur: () => {},
  onFocus: () => {},
  onChange: () => {},
};

export default Switch;
