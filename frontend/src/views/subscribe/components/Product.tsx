import styled from '@emotion/styled';
import { colors } from '@mui/material';
import Paper from '@mui/material/Paper';
import { useCallback } from 'react';
import { Product, Currency } from 'common';
import { useTranslation } from 'react-i18next';

interface ProductDisplayProps {
  product: Product;
  currency: Currency;
  selected: boolean;
  yearly: boolean;
  onSelect: (product: Product) => void;
}

function ProductDisplay({
  product,
  selected,
  currency,
  yearly,
  onSelect,
}: ProductDisplayProps) {
  const { t } = useTranslation();

  const handleOrder = useCallback(() => {
    onSelect(product);
  }, [onSelect, product]);

  const price =
    yearly && product.recurring
      ? (product[currency] / 100) * 11
      : product[currency] / 100;

  return (
    <Container onClick={handleOrder} selected={selected}>
      <Paper elevation={selected ? 24 : 2}>
        <Header>{product.name}</Header>
        <Description>{t(`Products.${product.plan}`)}</Description>
        <Seats>
          {product.seats
            ? t('Products.users', { users: product.seats })
            : `${t('Products.unlimited_seats')} 🎉`}
        </Seats>

        <Total>
          {price.toFixed(2)} {currency.toUpperCase()}
          {product.recurring ? (
            <PerMonth>
              / {yearly ? t('Products.year') : t('Products.month')}
            </PerMonth>
          ) : null}
        </Total>
        <PickMe>
          <PickMeButton>
            {product.recurring
              ? t('SubscribeModal.subscribeButton')
              : t('SubscribeModal.payButton')}
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
    ${(props) => (props.selected ? 'var(--rs-accent)' : colors.grey[50])};
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
  color: var(--rs-accent);
`;

const Total = styled.div`
  background-color: var(--rs-accent);
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
  border: 1px solid var(--rs-accent);
  color: var(--rs-accent);
  border-radius: 10px;
  font-size: 1.5em;
  font-weight: 500;
  text-align: center;
  padding: 5px;

  :hover {
    background-color: var(--rs-accent);
    color: var(--rs-accent-contrast);
  }
`;

export default ProductDisplay;
