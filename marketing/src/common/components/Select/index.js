import React from 'react';
import ReactSelect from 'react-select';
import PropTypes from 'prop-types';
import SelectStyle from './select.style';

const Select = ({ className, labelText, labelPosition, ...props }) => {
  // Add all classes to an array
  const addAllClasses = ['reusecore__select'];

  // Add label position class
  if (labelPosition) {
    addAllClasses.push(`label_${labelPosition}`);
  }

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  const LabelField = labelText && (
    <span className="reusecore__field-label">{labelText}</span>
  );

  const position = labelPosition || 'top';

  return (
    <SelectStyle className={addAllClasses.join(' ')}>
      {position === 'left' || position === 'right' || position === 'top'
        ? LabelField
        : ''}

      <ReactSelect
        className="select-field__wrapper"
        classNamePrefix="select"
        {...props}
      />
      {position === 'bottom' && LabelField}
    </SelectStyle>
  );
};

Select.propTypes = {
  /** You can add your custom class for select wrapper component.
   * note: We manualy add react-select className and classNamePrefix props value */
  className: PropTypes.string,

  /** labelText of the select field */
  labelText: PropTypes.string,

  /** Set label position of the select field. By default it's top */
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
};

Select.defaultProps = {
  as: 'div',
  labelPosition: 'top',
};

export default Select;
