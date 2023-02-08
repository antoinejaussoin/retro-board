import React from 'react';
import PropTypes from 'prop-types';
import HamburgMenuWrapper from './hamburgMenu.style';

type HamburgMenuProps = {
  /** ClassName of the Hamburg menu. */
  className?: string;

  /** barColor allow to change hambrug menu's bar color. */
  barColor: string;

  /** wrapperStyle prop allow to change Hamburg menu bg color, width, height, space, boxShadow, border and borderRadius.*/
  wrapperStyle?: any;
};

const HamburgMenu = ({
  className,
  wrapperStyle,
  barColor,
  ...props
}: HamburgMenuProps) => {
  // Add all classs to an array
  const addAllClasses = ['hamburgMenu__bar'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <HamburgMenuWrapper
      className={addAllClasses.join(' ')}
      {...wrapperStyle}
      barColor={barColor}
      aria-label="hamburgMenu"
      {...props}
    >
      <span />
      <span />
      <span />
    </HamburgMenuWrapper>
  );
};

HamburgMenu.propTypes = {
  /** ClassName of the Hamburg menu. */
  className: PropTypes.string,

  /** barColor allow to change hambrug menu's bar color. */
  barColor: PropTypes.string,

  /** wrapperStyle prop allow to change Hamburg menu bg color, width, height, space, boxShadow, border and borderRadius.*/
  wrapperStyle: PropTypes.object,
};

export default HamburgMenu;
