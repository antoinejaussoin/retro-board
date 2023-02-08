import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  borders,
  borderColor,
  borderRadius,
  boxShadow,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  opacity,
} from 'styled-system';
import { cards } from '../customVariant';
import { base, themed } from '../base';

const CardWrapper = styled('div')(
  base,
  borders,
  borderColor,
  borderRadius,
  boxShadow,
  backgroundImage,
  backgroundSize,
  backgroundPosition,
  backgroundRepeat,
  opacity,
  cards,
  themed('Card')
);

const Card = ({ children, ...props }) => (
  <CardWrapper {...props}>{children}</CardWrapper>
);

Card.propTypes = {
  children: PropTypes.any,
  ...borders.propTypes,
  ...borderColor.propTypes,
  ...borderRadius.propTypes,
  ...boxShadow.propTypes,
  ...backgroundImage.propTypes,
  ...backgroundSize.propTypes,
  ...backgroundPosition.propTypes,
  ...backgroundRepeat.propTypes,
  ...opacity.propTypes,
  ...cards.propTypes,
};

Card.defaultProps = {
  boxShadow: '0px 20px 35px rgba(0, 0, 0, 0.05)',
};
export default Card;
