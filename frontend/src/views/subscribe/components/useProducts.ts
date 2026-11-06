import type { Product } from 'common';
import { useQuery } from '@tanstack/react-query';
import { getProducts } from '../../../api';
import { queryKeys } from '../../../state/queryKeys';

export default function useProducts(): Product[] {
  const { data = [] } = useQuery({
    queryKey: queryKeys.products,
    queryFn: async () => (await getProducts()) ?? [],
  });
  return data;
}
