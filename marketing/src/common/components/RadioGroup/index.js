import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ComponentWrapper from './radioGroup.style';

const RadioGroup = ({ className, name, value, items, onUpdate }) => {
  const [state, setState] = useState({ value: value });

  const onChange = (e) => {
    const currentValue = e.target.value;
    setState({
      ...state,
      value: currentValue,
    });
    onUpdate(e.target.value);
  };

  const addAllClasses = ['radio_group'];

  if (className) {
    addAllClasses.push(className);
  }

  return (
    <ComponentWrapper className={addAllClasses.join(' ')}>
      {items.map((item) => (
        <label
          htmlFor={item.title.toLowerCase().split(' ').join('-')}
          key={`radio__group-id${item.id}`}
          className={state.value === item.value ? 'active' : ''}
        >
          <input
            type="radio"
            id={item.title.toLowerCase().split(' ').join('-')}
            name={name}
            onChange={onChange}
            value={item.value}
            checked={state.value === item.value}
            disabled={item.disabled}
          />
          {item.title || item.text ? (
            <div className="content">
              <h4>{item.title && item.title}</h4>
              <p>{item.text && item.text}</p>
            </div>
          ) : (
            ''
          )}
        </label>
      ))}
    </ComponentWrapper>
  );
};

RadioGroup.propTypes = {
  /** className of the RadioGroup. */
  className: PropTypes.string,
  /** title or value of the RadioGroup. */
  title: PropTypes.string,
  /** text or sub title for single radio component / element. */
  text: PropTypes.string,
  /** active item value of the RadioGroup. The prop should be a string but in camelCase. */
  value: PropTypes.string,
  /** RadioGroup data in array of object form. Each object item should has 3 properties id, title and text. */
  items: PropTypes.array,
  /** This prop contain active radio field value.*/
  onUpdate: PropTypes.func,
};

/** RadioGroup default type. */
RadioGroup.defaultProps = {
  onUpdate: () => {},
};

export default RadioGroup;
