import PropTypes from 'prop-types';
import Slider from 'rc-slider';
import Tooltip from 'rc-tooltip';
import React, { Fragment } from 'react';
import 'rc-slider/assets/index.css';
import RangeBoxStyle from './range.style';

const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);
const Handle = Slider.Handle;

const toolTipHandleFunc = (props) => {
  const { value, dragging, index, ...restProps } = props;
  return (
    <Tooltip
      prefixCls="reusecore__rc_slider_tooltip rc-slider-tooltip"
      overlay={value}
      visible={dragging}
      placement="top"
      key={index}
    >
      <Handle value={value} {...restProps} />
    </Tooltip>
  );
};

const SliderBox = (props) => {
  const {
    min,
    max,
    stepper,
    dots,
    slideDefaultValue,
    vertical,
    disabled,
    handleChangefunc,
    ...others
  } = props;
  return (
    <Slider
      dots={dots}
      min={min}
      max={max}
      step={stepper}
      value={slideDefaultValue}
      onChange={handleChangefunc}
      disabled={disabled}
      handle={toolTipHandleFunc}
      vertical={vertical}
      {...others}
    />
  );
};

const RangeBox = (props) => {
  const {
    min,
    max,
    stepper,
    unit,
    dots,
    placement,
    rangeDefaultValue,
    vertical,
    disabled,
    handleChangefunc,
    ...others
  } = props;
  const defaultThresholdInit = rangeDefaultValue?.[0]
    ? rangeDefaultValue[0]
    : 0;
  const defaultThresholdLast = rangeDefaultValue?.[1]
    ? rangeDefaultValue[1]
    : 0;
  const toolTipConfig = {
    placement,
    prefixCls: 'reusecore__rc_slider_tooltip rc-slider-tooltip',
  };
  return (
    <Range
      dots={dots}
      min={min}
      max={max}
      step={stepper}
      value={[defaultThresholdInit, defaultThresholdLast]}
      onChange={handleChangefunc}
      disabled={disabled}
      tipFormatter={(value) => `${value}${unit}`}
      tipProps={toolTipConfig}
      vertical={vertical}
      {...others}
    />
  );
};

export default function RangeWithRCSlide({
  className,
  labelText,
  labelPosition,
  type,
  ...props
}) {
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
          {position === 'left' || position === 'right' ? LabelField : ''}
          {type && type === 'range' ? (
            <RangeBox {...props} />
          ) : (
            <SliderBox {...props} />
          )}
          <div>
            <div />
          </div>
        </label>
      </RangeBoxStyle>
    </Fragment>
  );
}

RangeBox.propTypes = {
  /** ClassName of the range-box */
  className: PropTypes.string,

  /** labelText of the range-box field */
  labelText: PropTypes.string,

  /** labelText of the range-box field */
  labelPosition: PropTypes.oneOf(['right', 'left']),

  /** type of the range-box  */
  type: PropTypes.oneOf(['range', 'slide']).isRequired,

  /** toolitip-placement of the range-box [for type="range" only]  */
  placement: PropTypes.oneOf([
    'left',
    'right',
    'top',
    'bottom',
    'topLeft',
    'topRight',
    'bottomLeft',
    'bottomRight',
  ]),

  /** Minimum value of the range-box field */
  min: PropTypes.number.isRequired,

  /** Maximum value of the range-box field */
  max: PropTypes.number.isRequired,

  /** Stepper value of the range-box field */
  stepper: PropTypes.number.isRequired,

  /** Default value of the range-box field [for type="slide" only] */
  slideDefaultValue: PropTypes.number,

  /** Default value of the range-box field [for type="range" only] */
  rangeDefaultValue: PropTypes.array,

  /** Unit value of the range-box tooltip field [for type="range" only] */
  unit: PropTypes.string,

  /** dots of the range-box field  */
  dots: PropTypes.bool,

  /** disabled of the range-box field */
  disabled: PropTypes.bool,

  /** vertical of the range-box field */
  vertical: PropTypes.bool,
};

/** RangeBox default proptype */
RangeBox.defaultProps = {
  labelText: 'ReuseCore RangeBox',
  labelPosition: 'right',
  className: 'rangebox_wrapper_className',
  type: 'slide',
  disabled: false,
  min: 0,
  max: 100,
  stepper: 5,
  unit: '',
  placement: 'top',
  slideDefaultValue: 3,
  rangeDefaultValue: [0, 50],
  dots: true,
  vertical: false,
};
