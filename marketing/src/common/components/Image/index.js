import PropTypes from 'prop-types';
import React from 'react';
import styled from 'styled-components';
import { base, themed } from '../base';

const ImageWrapper = styled('img')(
  {
    display: 'block',
    maxWidth: '100%',
    height: 'auto',
  },
  base,
  themed('Image'),
);

const Image = ({ src, alt, m = 0, ...props }) => (
  <ImageWrapper src={src} alt={alt} m={m} {...props} />
);

export default Image;

Image.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
};
