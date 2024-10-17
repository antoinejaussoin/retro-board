/** this is our Base Component every components must be Extend it */
import {
  alignSelf,
  borderColor,
  borders,
  color,
  compose,
  display,
  flex,
  fontSize,
  height,
  maxHeight,
  maxWidth,
  minHeight,
  minWidth,
  order,
  space,
  width,
} from 'styled-system';

export const themed = (key) => (props) => props.theme[key];

export const base = compose(
  () => ({ boxSizing: 'border-box' }),
  space,
  width,
  minWidth,
  maxWidth,
  height,
  minHeight,
  maxHeight,
  fontSize,
  color,
  flex,
  order,
  alignSelf,
  borders,
  borderColor,
  display,
);

base.propTypes = {
  ...display.propTypes,
  ...space.propTypes,
  ...borders.propTypes,
  ...borderColor.propTypes,
  ...width.propTypes,
  ...height.propTypes,
  ...fontSize.propTypes,
  ...color.propTypes,
  ...flex.propTypes,
  ...order.propTypes,
  ...alignSelf.propTypes,
};
