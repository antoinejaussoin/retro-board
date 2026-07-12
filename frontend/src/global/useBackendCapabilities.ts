import type { BackendCapabilities } from 'common';
import { useSuspenseQuery } from '@tanstack/react-query';
import { loadBackendCapabilities } from './state';
import { queryKeys } from 'state/queryKeys';

export default function useBackendCapabilities(): BackendCapabilities {
  const { data } = useSuspenseQuery({
    queryKey: queryKeys.backendCapabilities,
    queryFn: loadBackendCapabilities,
  });
  return data;
}
