import * as rawAnchorLink from 'react-anchor-link-smooth-scroll/lib/anchor-link.js';

const AnchorLink = unwrapDefault(rawAnchorLink);

export default AnchorLink;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}