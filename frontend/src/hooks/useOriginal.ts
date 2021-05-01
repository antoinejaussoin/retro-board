import { useState } from 'react';

export default function useOriginal<T>(value: T) {
  const [firstValue] = useState<T | undefined>(value);

  return firstValue;
}
