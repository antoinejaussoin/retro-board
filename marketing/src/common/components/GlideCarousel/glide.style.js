import styled from 'styled-components';
import {
  width,
  height,
  display,
  space,
  color,
  borders,
  boxShadow,
  borderRadius,
  position,
  top,
  left,
  right,
  bottom,
  alignItems,
  justifyContent,
  flexWrap,
} from 'styled-system';

// Glide wrapper style
const GlideWrapper = styled.div`
  ${width}
  ${height}
  ${space}
`;

// Glide slide wrapper style
const GlideSlideWrapper = styled.li`
  ${space}
  ${color}
  ${borders}
  ${boxShadow}
  ${borderRadius}
`;

// Button wrapper style
const ButtonWrapper = styled.div`
  display: inline-block;
  ${display}
  ${space}
  ${color}
  ${borders}
  ${boxShadow}
  ${borderRadius}
  ${position}
  ${top}
  ${left}
  ${right}
  ${bottom}
`;

// ButtonControlWrapper style
const ButtonControlWrapper = styled.div`
  ${display}
  ${space}
  ${alignItems}
  ${justifyContent}
  ${position}
  ${top}
  ${left}
  ${right}
  ${bottom}
`;

// BulletControlWrapper style
const BulletControlWrapper = styled.div`
  ${display}
  ${space}
  ${alignItems}
  ${justifyContent}
  ${flexWrap}
`;

// BulletButton style
const BulletButton = styled.button`
  cursor: pointer;
  width: 10px;
  height: 10px;
  margin: 4px;
  border: 0;
  padding: 0;
  outline: none;
  border-radius: 50%;
  background-color: #d6d6d6;

  &:hover,
  &.glide__bullet--active {
    background-color: #869791;
  }

  ${display}
  ${space}
  ${color}
  ${borders}
  ${boxShadow}
  ${borderRadius}
  ${width}
  ${height}
`;

// default button style
const DefaultBtn = styled.button`
  cursor: pointer;
  margin: 10px 3px;
`;

export {
  GlideSlideWrapper,
  ButtonControlWrapper,
  ButtonWrapper,
  BulletControlWrapper,
  BulletButton,
  DefaultBtn,
};
export default GlideWrapper;
