import { useCallback, useState } from 'react';

export default function useToggle(initialValue: boolean) {
  const [value, setValue] = useState(initialValue);
  const toggler = useCallback(() => setValue((value) => !value), []);
  return [value, toggler];
}
