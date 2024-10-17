import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

type UseStateFetchValue<T> = [
  T,
  Dispatch<SetStateAction<T>>,
  boolean,
  Error | null,
];

function useStateFetch<T>(
  url: string | null,
  defaultValue: T,
): UseStateFetchValue<T> {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<T>(defaultValue);

  useEffect(() => {
    async function fetchData() {
      if (url) {
        try {
          const response = await fetch(url);
          if (response.ok) {
            const responseData = (await response.json()) as T;
            setData(responseData);
            setLoading(false);
            setError(null);
          } else {
            setLoading(false);
            setError(new Error('Unspecified error'));
          }
        } catch (error) {
          console.error('Fetching data failed: ', error);
          setLoading(false);
          setError(new Error('Unspecified error'));
        }
      }
    }
    if (url) {
      setLoading(true);
      fetchData();
    } else {
      setLoading(false);
      setError(null);
    }
  }, [url]);

  return [data, setData, loading, error];
}

export default useStateFetch;
