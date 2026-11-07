import { Product, Currency, Plan } from 'common';
import 'flag-icons/css/flag-icons.min.css';
import { useCallback } from 'react';
import ProductDisplay from './Product';

interface ProductPickerProps {
  value: Plan | null;
  currency: Currency;
  products: Product[];
  yearly: boolean;
  onChange: (value: Plan) => void;
}

function ProductPicker({
  value,
  currency,
  products,
  yearly,
  onChange,
}: ProductPickerProps) {
  const handleChange = useCallback(
    (product: Product) => {
      onChange(product.plan);
    },
    [onChange],
  );
  return (
    <div className="flex flex-wrap justify-center gap-5">
      {products.map((product) => (
        <ProductDisplay
          key={product.plan}
          product={product}
          currency={currency}
          yearly={yearly}
          onSelect={handleChange}
          selected={value === product.plan}
        />
      ))}
    </div>
  );
}

export default ProductPicker;
