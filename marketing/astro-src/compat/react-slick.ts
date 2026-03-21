import * as rawReactSlick from 'react-slick/lib/slider.js';

const Slider = unwrapDefault(rawReactSlick);

export default Slider;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}