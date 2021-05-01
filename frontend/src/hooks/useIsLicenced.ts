import useStateFetch from './useStateFetch';

export default function useIsLicenced() {
  const [licenced] = useStateFetch('/api/licenced', true);
  return licenced;
}
