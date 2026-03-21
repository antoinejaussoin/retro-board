import * as rawDrawer from 'rc-drawer/lib/index.js';

const RcDrawer = unwrapDefault(rawDrawer);

export default RcDrawer;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}
