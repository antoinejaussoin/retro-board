import type { ReactNode } from 'react';
import rawFade from 'react-reveal/Fade';

type FadeProps = {
  children?: ReactNode;
  big?: boolean;
  bottom?: boolean;
  cascade?: boolean;
  delay?: number;
  distance?: string;
  duration?: number;
  fraction?: number;
  left?: boolean;
  right?: boolean;
  spy?: unknown;
  top?: boolean;
  up?: boolean;
  when?: boolean;
};

// react-reveal only renders when called with `true` as the second argument.
// React 19 no longer passes a legacy context argument, so JSX alone returns
// the animation config object instead of an element.
export default function Fade(props: FadeProps) {
  return rawFade(props, true);
}
