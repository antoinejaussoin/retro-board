import { Icon as KitIconBase, type IconProp } from 'react-icons-kit';

// react-icons-kit sets `tag` through defaultProps, which React 19 ignores
// on function components. Without a tag, it renders an undefined element.
export function Icon(props: IconProp) {
  return <KitIconBase {...props} tag={props.tag ?? 'i'} />;
}
