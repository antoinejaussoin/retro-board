import { useEffect, useRef } from 'react';

export default function useMutableRead<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref;
}
