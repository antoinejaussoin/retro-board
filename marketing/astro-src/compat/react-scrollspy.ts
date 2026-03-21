import * as rawScrollSpy from 'react-scrollspy/lib/scrollspy.js';

const ScrollSpy = unwrapDefault(rawScrollSpy);

export default ScrollSpy;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}
