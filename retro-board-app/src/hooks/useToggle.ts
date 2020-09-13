import { useCallback, useState } from 'react';

export default function useToggle(
  defaultState: boolean
): [boolean, () => void] {
  const [value, setValue] = useState(defaultState);
  const handleToggle = useCallback(() => {
    setValue(v => !v);
  }, []);
  return [value, handleToggle];
}
