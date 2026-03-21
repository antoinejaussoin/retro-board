import * as rawCollapse from 'rc-collapse/lib/Collapse.js';
import * as rawPanel from 'rc-collapse/lib/Panel.js';

const Collapse = unwrapDefault(rawCollapse);
const Panel = unwrapDefault(rawPanel);

export { Panel };
export default Collapse;

function unwrapDefault<T>(value: T): T {
  let current: unknown = value;

  while (current && typeof current === 'object' && 'default' in current) {
    current = (current as { default: unknown }).default;
  }

  return current as T;
}
