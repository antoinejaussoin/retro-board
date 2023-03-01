import themeGet from '@styled-system/theme-get';
import React from 'react';
import styled from 'styled-components';
import {
  fontFamily,
  fontWeight,
  textAlign,
  lineHeight,
  letterSpacing,
} from 'styled-system';
import { base, themed } from '../base';

const Container = styled.div`
  strong {
    color: ${themeGet('colors.secondary')};
  }
`;

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
  className?: string;
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
  <Container>
    <HeadingWrapper as={as} mt={mt} mb={mb} fontWeight={fontWeight} {...props}>
      {content}
    </HeadingWrapper>
  </Container>
);

export default Heading;
