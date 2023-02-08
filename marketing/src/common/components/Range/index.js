import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import RangeBoxStyle from './range.style';
import Rheostat from 'rheostat';
import 'rheostat/initialize';

const handleChange = (props) => {
  console.log(props, 'current range value');
};

//Main Component
const RangeBox = ({ className, labelText, labelPosition, type, ...props }) => {
  const { min, max } = props;
  let initValue, lastValue;
  initValue = min ? min : 0;
  lastValue = max ? max : 100;

  // Add all classs to an array
  const addAllClasses = ['reusecore__rangebox'];
  // Add label position class
  if (labelPosition) {
    addAllClasses.push(`label_${labelPosition}`);
  }
  // label control
  const position = labelPosition || 'right';
  const LabelField = labelText && (
    <span className="reusecore__field-label">{labelText}</span>
  );
  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <Fragment>
      <RangeBoxStyle className={addAllClasses.join(' ')}>
        <label>
          {position === 'left' || position === 'right' || position === 'top'
            ? LabelField
            : ''}
          <Rheostat
            min={initValue}
            max={lastValue}
            values={[initValue, lastValue]}
            onChange={handleChange}
          />
          <div>
            <div />
          </div>
          {position === 'bottom' && LabelField}
        </label>
      </RangeBoxStyle>
    </Fragment>
  );
};

RangeBox.propTypes = {
  /** labelText of the range-box field */
  labelText: PropTypes.string,

  /** labelText of the range-box field */
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'right', 'left']),

  // /** type of the range-box  */
  // type: PropTypes.oneOf(['range', 'slide']).isRequired,

  // /** toolitip-placement of the range-box [for type="range" only]  */
  // placement: PropTypes.oneOf([
  //   'left',
  //   'right',
  //   'top',
  //   'bottom',
  //   'topLeft',
  //   'topRight',
  //   'bottomLeft',
  //   'bottomRight'
  // ]),

  /** Minimum value of the range-box field */
  min: PropTypes.number.isRequired,

  /** Maximum value of the range-box field */
  max: PropTypes.number.isRequired,

  // /** Stepper value of the range-box field */
  // stepper: PropTypes.number.isRequired,

  // /** Default value of the range-box field [for type="slide" only] */
  // slideDefaultValue: PropTypes.number,

  // /** Default value of the range-box field [for type="range" only] */
  // rangeDefaultValue: PropTypes.array,

  // /** Unit value of the range-box tooltip field [for type="range" only] */
  // unit: PropTypes.string,

  // /** dots of the range-box field  */
  // dots: PropTypes.bool,

  // /** disabled of the range-box field */
  // disabled: PropTypes.bool,

  // /** vertical of the range-box field */
  // vertical: PropTypes.bool
};

/** RangeBox default proptype */
RangeBox.defaultProps = {
  labelText: 'ReuseCore RangeBox',
  labelPosition: 'top',
  // type: 'range',
  // disabled: false,
  min: 0,
  max: 100,
  // stepper: 5
  // unit: ' BDT',
  // placement: 'top',
  // slideDefaultValue: 3,
  // rangeDefaultValue: [20, 50],
  // dots: true,
  // vertical: false
};
export default RangeBox;
