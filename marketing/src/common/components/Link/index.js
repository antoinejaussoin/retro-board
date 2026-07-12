import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { base, themed } from '../base';

const LinkWrapper = styled('a')(
  { textDecoration: 'none', alignItems: 'center' },
  base,
  themed('Link'),
);

const Link = ({
  children,
  as = 'a',
  m = 0,
  display = 'inline-flex',
  ...props
}) => (
  <LinkWrapper as={as} m={m} display={display} {...props}>
    {children}
  </LinkWrapper>
);

export default Link;

Link.propTypes = {
  as: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  children: PropTypes.any.isRequired,
  ...base.propTypes,
};
