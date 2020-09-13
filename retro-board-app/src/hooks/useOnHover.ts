import { useRef, useState, useEffect } from 'react';

export default function useOnHover<T extends HTMLElement>(): [
  boolean,
  React.RefObject<T>
] {
  const ref = useRef<T>(null);
  const [hover, setHover] = useState(false);
  useEffect(() => {
    if (ref.current) {
      ref.current.addEventListener('mouseenter', () => {
        setHover(true);
      });
      ref.current.addEventListener('mouseleave', () => {
        setHover(false);
      });
    }
  }, []);

  return [hover, ref];
}
