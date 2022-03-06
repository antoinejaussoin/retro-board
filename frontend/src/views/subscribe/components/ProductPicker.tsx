import { Product, Currency, Plan } from 'common';
import 'flag-icons/css/flag-icons.min.css';
import { useCallback } from 'react';
import styled from '@emotion/styled';
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
    [onChange]
  );
  return (
    <Container>
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
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  > * {
    margin: 20px;
  }

  @media screen and (max-width: 600px) {
    > * {
      margin: 5px;
    }
    > * {
      width: 100%;
    }
  }
`;

export default ProductPicker;
