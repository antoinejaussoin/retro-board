import React from 'react';
import PropTypes from 'prop-types';
import {
  AccordionWrapper,
  AccordionItemWrapper,
  AccordionTitleWrapper,
  AccordionItemButtonWrapper,
  AccordionBodyWrapper,
  IconWrapper,
  OpenIcon,
  CloseIcon,
} from './accordion.style';

const Accordion = ({
  className,
  children,
  allowZeroExpanded = true,
  preExpanded = [],
}) => {
  // Add all classs to an array
  const addAllClasses = ['reusecore__accordion'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <AccordionWrapper
      allowZeroExpanded={allowZeroExpanded}
      className={addAllClasses.join(' ')}
      preExpanded={preExpanded}
    >
      {children}
    </AccordionWrapper>
  );
};

const AccordionItem = ({ className, children, uuid }) => {
  // Add all classs to an array
  const addAllClasses = ['accordion__item'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <AccordionItemWrapper className={addAllClasses.join(' ')} uuid={uuid}>
      {children}
    </AccordionItemWrapper>
  );
};

const AccordionTitle = ({ className, children }) => {
  // Add all classs to an array
  const addAllClasses = ['accordion__header'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <AccordionTitleWrapper className={addAllClasses.join(' ')}>
      <AccordionItemButtonWrapper>{children}</AccordionItemButtonWrapper>
    </AccordionTitleWrapper>
  );
};

const AccordionBody = ({ className, children }) => {
  // Add all classs to an array
  const addAllClasses = ['accordion__body'];

  // className prop checking
  if (className) {
    addAllClasses.push(className);
  }

  return (
    <AccordionBodyWrapper className={addAllClasses.join(' ')}>
      {children}
    </AccordionBodyWrapper>
  );
};

Accordion.propTypes = {
  /** ClassName of the Accordion. Default class is reusecore__accordion*/
  className: PropTypes.string,

  /** Used to render any component */
  children: PropTypes.element,
};

AccordionItem.propTypes = {
  /** ClassName of the AccordionItem. Default class is accordion__item */
  className: PropTypes.string,

  /** Used to render any component */
  children: PropTypes.element,
};

AccordionTitle.propTypes = {
  /** ClassName of the AccordionTitle. Default class is accordion__header */
  className: PropTypes.string,

  /** Used to render any component */
  children: PropTypes.element,
};

AccordionBody.propTypes = {
  /** ClassName of the AccordionBody. Default class is accordion__body */
  className: PropTypes.string,

  /** Used to render any component */
  children: PropTypes.element,
};

export {
  Accordion,
  AccordionItem,
  AccordionTitle,
  AccordionBody,
  IconWrapper,
  OpenIcon,
  CloseIcon,
};
