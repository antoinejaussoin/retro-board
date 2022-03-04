import noop from 'lodash/noop';
import { Currency } from 'common';
import 'flag-icons/css/flag-icons.min.css';
import { currencies } from './types';
import styled from '@emotion/styled';
import { colors } from '@mui/material';

interface CurrencyPickerProps {
  value: Currency;
  disabled: boolean;
  onChange: (value: Currency) => void;
}

function CurrencyPicker({ value, disabled, onChange }: CurrencyPickerProps) {
  return (
    <Container>
      {currencies.map((currency) => (
        <CurrencyContainer
          key={currency.value}
          selected={currency.value === value}
          onClick={() => (!disabled ? onChange(currency.value) : noop)}
        >
          <Flag className={`fi fi-${currency.iso}`}>
            <FlagOverlay />
          </Flag>
          <CurrencyValue>{currency.value.toUpperCase()}</CurrencyValue>
        </CurrencyContainer>
      ))}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
`;

const CurrencyContainer = styled.div<{ selected: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: ${(props) => (props.selected ? '1' : '0')}px solid
    ${colors.deepPurple[500]};
  border-radius: 3px;
  margin: ${(props) => (props.selected ? '0' : '1')}px;
  padding: 5px 0 2px 0px;
  cursor: pointer;
`;

const CurrencyValue = styled.div`
  color: ${colors.grey[500]};
  font-size: 0.7em;
  margin-top: 2px;
`;

const Flag = styled.div`
  font-size: 32px;
  margin-left: 10px;
  height: 32px;
  margin-right: 8px;
  position: relative;
`;

const FlagOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  height: 32px;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.5) 0%,
    rgba(255, 255, 255, 0) 100%
  );
`;

export default CurrencyPicker;
