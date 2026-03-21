import * as rawFade from 'react-reveal/Fade.js';

const Fade = unwrapDefault(rawFade);

export default Fade;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}