import React from 'react';
import PropTypes from 'prop-types';
import AlertStyle from './alert.style';

const Alert = ({ className, isMaterial, children, ...props }) => {
  // Add all classs to an array
  const addAllClasses = ['reusecore__alert'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  // isMaterial prop checking
  if (isMaterial) {
    addAllClasses.push('is-material');
  }

  return (
    <AlertStyle className={addAllClasses.join(' ')} {...props}>
      {children}
    </AlertStyle>
  );
};

Alert.propTypes = {
  /** ClassName of the Alert */
  className: PropTypes.string,

  /** Add Material effect */
  isMaterial: PropTypes.bool,

  /** Used to render icon, button, text or any elements inside the Alert.
   * This can be a string or any component. */
  children: PropTypes.element,
};

Alert.defaultProps = {};

export default Alert;
