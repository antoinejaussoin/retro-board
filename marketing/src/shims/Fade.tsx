import type { ReactNode } from 'react';

type FadeProps = {
  children?: ReactNode;
  // Legacy react-reveal props — ignored; library is unmaintained under React 19
  up?: boolean;
  down?: boolean;
  left?: boolean;
  right?: boolean;
  delay?: number;
  duration?: number;
  cascade?: boolean;
  [key: string]: unknown;
};

/** Pass-through shim replacing unmaintained react-reveal/Fade for React 19. */
export default function Fade({ children }: FadeProps) {
  return <>{children}</>;
}
