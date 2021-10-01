import { useCallback } from 'react';
import styled from '@emotion/styled';
import Button from '@mui/material/Button';

interface QuantitySelectorProps {
  value: number;
  step: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}

function QuantitySelector({
  value,
  step,
  min,
  max,
  onChange,
}: QuantitySelectorProps) {
  const handlePlus = useCallback(() => {
    const newValue = value + step;
    if (newValue > max) {
      return;
    }
    onChange(newValue);
  }, [value, step, max, onChange]);
  const handleMinus = useCallback(() => {
    const newValue = value - step;
    if (newValue < min) {
      return;
    }
    onChange(newValue);
  }, [value, step, min, onChange]);
  const canPlus = value + step <= max;
  const canMinus = value - step >= min;
  return (
    <Container>
      <Buttons>
        <Button disabled={!canMinus} onClick={handleMinus}>
          -
        </Button>
      </Buttons>
      <Value>{value}&nbsp;seats</Value>
      <Buttons>
        <Button disabled={!canPlus} onClick={handlePlus}>
          +
        </Button>
      </Buttons>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
`;

const Value = styled.div`
  font-size: 2em;
  font-weight: 100;
`;

const Buttons = styled.div``;

export default QuantitySelector;
