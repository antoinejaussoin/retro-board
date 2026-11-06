import { useCallback } from 'react';
import { Button } from 'ui/button';

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
    <div className="my-5 flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="sm"
        disabled={!canMinus}
        onClick={handleMinus}
      >
        -
      </Button>
      <div className="text-3xl font-medium tracking-tight">
        {value}&nbsp;seats
      </div>
      <Button
        variant="outline"
        size="sm"
        disabled={!canPlus}
        onClick={handlePlus}
      >
        +
      </Button>
    </div>
  );
}

export default QuantitySelector;
