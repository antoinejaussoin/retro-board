import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { SingleDatePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import DatePickerStyle from './datepicker.style';
// import moment from 'moment';

class DatePicker extends Component {
  constructor(props) {
    super(props);
    let date = null;
    this.state = {
      focused: false,
      date,
      dateFormat: 'l',
    };
    this.onDateChangeFunc = this.onDateChangeFunc.bind(this);
    this.onFocusChangeFunc = this.onFocusChangeFunc.bind(this);
  }

  onDateChangeFunc = (date) => {
    // ********* Date passing will be START here.... *********
    // const { dateFormat } = this.state;
    // const newDate = date.format(dateFormat);
    // ********* Date passing will be END here.... *********
    this.setState({ date });
  };

  onFocusChangeFunc = ({ focused }) => {
    this.setState({ focused });
  };

  render() {
    const { focused, date } = this.state;
    const {
      className,
      labelText,
      labelPosition,
      item,
      placeholder,
      disabled,
      showClearDate,
      isRTL,
      orientation,
      anchorDirection,
      withPortal,
      withFullScreenPortal,
      ...props
    } = this.props;

    // Add all classs to an array **************
    const addAllClasses = ['reusecore__DatePicker'];
    // Add label position class **************
    if (labelPosition) {
      addAllClasses.push(`label_${labelPosition}`);
    }
    // label control **************
    const position = labelPosition || 'right';
    const LabelField = labelText && (
      <span className="reusecore__field-label">{labelText}</span>
    );
    // className prop checking **************
    if (className) {
      addAllClasses.push(className);
    }

    // DatePicker Props List
    const datePickerPropsOptions = {
      id: item && item.id ? item.id : 'unique_id',
      date,
      focused,
      placeholder,
      disabled,
      isRTL,
      showClearDate,
      orientation,
      anchorDirection,
      withPortal,
      withFullScreenPortal,
      onFocusChange: this.onFocusChangeFunc,
      onDateChange: this.onDateChangeFunc,
      ...props,
    };
    // moment.locale('pl');
    return (
      <Fragment>
        <DatePickerStyle className={addAllClasses.join(' ')}>
          <label>
            {position === 'left' || position === 'right' || position === 'top'
              ? LabelField
              : null}
            <SingleDatePicker {...datePickerPropsOptions} />
            <div>
              <div />
            </div>
            {position === 'bottom' && LabelField}
          </label>
        </DatePickerStyle>
      </Fragment>
    );
  }
}

DatePicker.propTypes = {
  /** labelText of the date-picker field */
  labelText: PropTypes.string,
  /** labelText of the date-picker field */
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'right', 'left']),
  /** placeholder of the date-picker field */
  placeholder: PropTypes.string,
  /** disabled of the date-picker field */
  disabled: PropTypes.bool,
  /** showClearDate of the date-picker field */
  showClearDate: PropTypes.bool,
  /** isRTL of the date-picker field */
  isRTL: PropTypes.bool,
  /** orientation of the date-picker field */
  orientation: PropTypes.oneOf(['horizontal', 'vertical']),
  /** anchorDirection of the date-picker field */
  anchorDirection: PropTypes.oneOf(['left', 'right']),
  /** withPortal of the date-picker field */
  withPortal: PropTypes.bool,
  /** withFullScreenPortal of the date-picker field */
  withFullScreenPortal: PropTypes.bool,
};

/** RangeBox default proptype */
DatePicker.defaultProps = {
  labelText: 'ReuseCore DatePicker',
  labelPosition: 'top',
};
export default DatePicker;
