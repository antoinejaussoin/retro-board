import styled from '@emotion/styled';
import { colors } from '@mui/material';
import Paper from '@mui/material/Paper';
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
  const { Products: translations, SubscribeModal: subscribeTranslations } =
    useTranslations();
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
            : `${translations.unlimited_seats} 🎉`}
        </Seats>

        <Total>
          {(product[currency] / 100).toFixed(2)} {currency.toUpperCase()}
          {product.recurring ? (
            <PerMonth>/ {translations.month}</PerMonth>
          ) : null}
        </Total>
        <PickMe>
          <PickMeButton>
            {product.recurring
              ? subscribeTranslations.subscribeButton
              : subscribeTranslations.payButton}
          </PickMeButton>
        </PickMe>
      </Paper>
    </Container>
  );
}

const Container = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  cursor: pointer;
  width: 300px;
  border-radius: 5px;
  border: 3px solid
    ${(props) => (props.selected ? colors.deepPurple[500] : colors.grey[50])};
`;

const Header = styled.div`
  padding: 20px;
  text-align: center;
  font-size: 2em;
  font-weight: 100;
`;

const Description = styled.div`
  padding: 20px;
  background-color: ${colors.grey[100]};
  color: ${colors.grey[700]};
  flex: 1;
`;

const Seats = styled.div`
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5em;
  font-weight: 300;
  color: ${colors.deepPurple[500]};
`;

const Total = styled.div`
  background-color: ${colors.deepPurple[500]};
  color: white;
  text-align: center;
  font-size: 2em;
  font-weight: 300;
  padding: 10px 0;
`;

const PerMonth = styled.span`
  font-size: 0.4em;
`;

const PickMe = styled.div`
  padding: 20px;
`;

const PickMeButton = styled.div`
  border: 1px solid ${colors.deepPurple[500]};
  color: ${colors.deepPurple[500]};
  border-radius: 10px;
  font-size: 1.5em;
  font-weight: 100;
  text-align: center;
  padding: 5px;

  :hover {
    background-color: ${colors.deepPurple[500]};
    color: white;
  }
`;

export default ProductDisplay;
