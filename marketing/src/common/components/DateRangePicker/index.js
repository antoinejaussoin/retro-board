import React, { Fragment, Component } from 'react';
import PropTypes from 'prop-types';
import { DateRangePicker } from 'react-dates';
import 'react-dates/lib/css/_datepicker.css';
import DateRangePickerStyle from './daterangepicker.style';
import moment from 'moment';

class DateRangePickerBox extends Component {
  constructor(props) {
    super(props);
    const { item } = this.props;
    let date,
      startDate,
      endDate = null;
    const separator = item && item.separator ? item.separator : '-';
    const dateFormat = item && item.format ? item.format : 'llll';
    if (date) {
      const dates = date.split(` ${separator} `);
      startDate = moment(dates[0], dateFormat);
      endDate = moment(dates[1], dateFormat);
    }
    this.state = {
      focusedInput: null,
      startDate,
      endDate,
      dateFormat,
    };
    this.onDateChangeFunc = this.onDateChangeFunc.bind(this);
    this.onFocusChangeFunc = this.onFocusChangeFunc.bind(this);
  }

  onDateChangeFunc = ({ startDate, endDate }) => {
    // ********* Date passing will be START here.... *********
    // const { item } = this.props;
    // const { dateFormat, separator } = this.state;
    // if (!startDate && !endDate) {
    //   this.props.updateData(item, separator);
    //   return;
    // }
    // this.setState({
    //   startDate,
    //   endDate
    // });
    // if (startDate !== null && endDate !== null) {
    //   moment.locale('en');
    //   this.props.updateData(
    //     item,
    //     `${startDate.format(dateFormat)} ${separator} ${endDate.format(
    //       dateFormat
    //     )}`
    //   );
    // }
    // ********* Date passing will be END here.... *********
    this.setState({ startDate, endDate });
  };

  onFocusChangeFunc = (focusedInput) => {
    return this.setState({ focusedInput });
  };

  render() {
    const { focusedInput, startDate, endDate } = this.state;
    const {
      className,
      labelText,
      labelPosition,
      item,
      startDateId,
      endDateId,
      startDatePlaceholderText,
      endDatePlaceholderText,
      disabled,
      showClearDates,
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
      startDateId: startDateId ? startDateId : 'start_unique_id',
      endDateId: endDateId ? endDateId : 'end_date_unique_id',
      startDate,
      endDate,
      focusedInput,
      startDatePlaceholderText,
      endDatePlaceholderText,
      disabled,
      isRTL,
      showClearDates,
      orientation,
      anchorDirection,
      withPortal,
      withFullScreenPortal,
      onFocusChange: this.onFocusChangeFunc,
      onDatesChange: this.onDateChangeFunc,
      ...props,
    };
    // if (item && item.locale) {
    //   moment.locale(item.locale);
    // } else {
    //   moment.locale('en');
    // }
    // console.log(datePickerPropsOptions, 'datePickerPropsOptions');
    return (
      <Fragment>
        <DateRangePickerStyle className={addAllClasses.join(' ')}>
          <label>
            {position === 'left' || position === 'right' || position === 'top'
              ? LabelField
              : null}
            <DateRangePicker {...datePickerPropsOptions} />
            {/* <DateRangePicker
              startDate={startDate} // momentPropTypes.momentObj or null,
              startDateId={startDateId} // PropTypes.string.isRequired,
              endDate={endDate} // momentPropTypes.momentObj or null,
              endDateId={endDateId} // PropTypes.string.isRequired,
              onDatesChange={onDateChangeFunc} // PropTypes.func.isRequired,
              focusedInput={focusedInput} // PropTypes.oneOf([START_DATE, END_DATE]) or null,
              onFocusChange={onFocusChangeFunc} // PropTypes.func.isRequired,
            /> */}
            <div>
              <div />
            </div>
            {position === 'bottom' && LabelField}
          </label>
        </DateRangePickerStyle>
      </Fragment>
    );
  }
}

DateRangePickerBox.propTypes = {
  /** labelText of the date-picker field */
  labelText: PropTypes.string,
  /** labelText of the date-picker field */
  labelPosition: PropTypes.oneOf(['top', 'bottom', 'right', 'left']),
  /** startDateId of the date-picker field */
  startDateId: PropTypes.string.isRequired,
  /** endDateId of the date-picker field */
  endDateId: PropTypes.string.isRequired, //
  /** startDatePlaceholderText of the date-picker field */
  startDatePlaceholderText: PropTypes.string,
  /** endDatePlaceholderText of the date-picker field */
  endDatePlaceholderText: PropTypes.string,
  /** disabled of the date-picker field */
  disabled: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.oneOf(['START_DATE', 'END_DATE']),
  ]),

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
DateRangePickerBox.defaultProps = {
  labelText: 'ReuseCore DateRangePickerBox',
  labelPosition: 'top',
};
export default DateRangePickerBox;
