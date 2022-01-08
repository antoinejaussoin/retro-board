import { useEffect, useState } from 'react';
import { Product } from 'common';
import { getProducts } from '../../../api';

export default function useProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    async function fetch() {
      const result = await getProducts();
      if (result) {
        setProducts(result);
      }
    }
    fetch();
  }, []);
  return products;
}
