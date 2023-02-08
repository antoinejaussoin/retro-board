import { useState, useEffect } from 'react';

export default function useMount() {
  const [isMount, setIsMount] = useState(false);

  useEffect(() => {
    setIsMount(true);
  }, []);

  return isMount;
}
