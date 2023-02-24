import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
} from 'styled-system';
import { base, themed } from '../base';

const HeadingWrapper = styled('p')(
  base,
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
  themed('Heading')
) as any;

type HeadingProps = {
  content: React.ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  mt?: number | string | Array<number | string>;
  mb?: number | string | Array<number | string>;
  fontFamily?: string | number | Array<string | number>;
  fontWeight?: string | number | Array<string | number>;
  textAlign?: string | number | Array<string | number>;
  lineHeight?: string | number | Array<string | number>;
  letterSpacing?: string | number | Array<string | number>;
};

const Heading = ({
  content,
  as = 'h2',
  mt = 0,
  mb = '1rem',
  fontWeight = 'bold',
  ...props
}: HeadingProps) => (
  <HeadingWrapper as={as} mt={mt} mb={mb} fontWeight={fontWeight} {...props}>
    {content}
  </HeadingWrapper>
);

export default Heading;

// Heading.propTypes = {
//   content: PropTypes.string,
//   as: PropTypes.oneOf(['h1', 'h2', 'h3', 'h4', 'h5', 'h6']),
//   mt: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   mb: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   fontFamily: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   fontWeight: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   textAlign: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   lineHeight: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   letterSpacing: PropTypes.oneOfType([
//     PropTypes.string,
//     PropTypes.number,
//     PropTypes.arrayOf(
//       PropTypes.oneOfType([PropTypes.string, PropTypes.number])
//     ),
//   ]),
//   ...base.propTypes,
// }

// Heading.defaultProps = {
//   as: 'h2',
//   mt: 0,
//   mb: '1rem',
//   fontWeight: 'bold',
// };
