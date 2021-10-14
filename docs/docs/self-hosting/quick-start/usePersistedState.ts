import { useState, Dispatch, SetStateAction, useEffect } from 'react';

type UsePersistedStateValue<T> = [T, Dispatch<SetStateAction<T>>];

function getFromLocalStorage<T>(key: string, defaultValue: T) {
  const current = localStorage.getItem('retrospected-docs-' + key);
  if (current) {
    return JSON.parse(current) as T;
  }
  return defaultValue;
}

function storeInLocalStorage<T>(key: string, value: T) {
  const json = JSON.stringify(value);
  localStorage.setItem('retrospected-docs-' + key, json);
}

/**
 * Similar to useState, except it persists the data to local storage, and retrieves it automatically when
 * mounted. Use it as you would use useState.
 * @param key Unique key, used to persist the data in local-storage
 * @param defaultValue Default value, of type T
 */
function usePersistedState<T>(
  key: string,
  defaultValue: T
): UsePersistedStateValue<T> {
  const [state, setState] = useState<T>(getFromLocalStorage(key, defaultValue));

  useEffect(() => {
    storeInLocalStorage(key, state);
  }, [state, key]);

  return [state, setState];
}

/** @component */
export default usePersistedState;
