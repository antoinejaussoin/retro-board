import React from 'react';
import styled from 'styled-components';
import { colors, Paper } from '@material-ui/core';
import { useCallback } from 'react';
import { Product, Currency } from '@retrospected/common';
import useTranslations from '../../../translations';

interface ProductDisplayProps {
  product: Product;
  currency: Currency;
  selected: boolean;
  onSelect: (product: Product) => void;
}

function ProductDisplay({
  product,
  selected,
  currency,
  onSelect,
}: ProductDisplayProps) {
  const { Products: translations } = useTranslations();
  const handleOrder = useCallback(() => {
    onSelect(product);
  }, [onSelect, product]);

  return (
    <Container onClick={handleOrder} selected={selected}>
      <Paper elevation={selected ? 24 : 2}>
        <Header>{product.name}</Header>
        <Description>{translations[product.plan]}</Description>
        <Seats>
          {product.seats
            ? translations.users!(product.seats)
            : translations.unlimited_seats}
        </Seats>
        <Total>
          {(product[currency] / 100).toFixed(2)} {currency.toUpperCase()}
          <PerMonth>/ {translations.month}</PerMonth>
        </Total>
      </Paper>
    </Container>
  );
}

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  width: 300px;
  outline: ${(props) => (props.selected ? '3' : '0')}px solid
    ${colors.deepPurple[500]};
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.deepPurple[500]};
`;

const Description = styled.div`
  padding: 20px;
  border-bottom: 1px solid ${colors.deepPurple[500]};
  background-color: ${colors.deepPurple[100]};
  flex: 1;
`;

const Seats = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: 100;
`;

const Total = styled.div`
  background-color: ${colors.deepPurple[500]};
  color: white;
  text-align: center;
  font-size: 2em;
  font-weight: 100;
`;

const PerMonth = styled.span`
  font-size: 0.4em;
`;

export default ProductDisplay;
