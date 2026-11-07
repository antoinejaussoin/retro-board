import { useMemo } from 'react';
import { Slider as RangeSlider } from 'ui/slider';

interface SliderProps {
  from: number;
  to: number;
  value: number;
  onChange: (value: number) => void;
}

const Slider = ({ from, to, value, onChange }: SliderProps) => {
  const marks = useMemo(() => {
    return Array.from({ length: Math.max(0, to - from + 1) }, (_, index) => ({
      value: index + from,
      label: `${index + from}`,
    }));
  }, [from, to]);

  return (
    <div className="pr-5">
      <RangeSlider
        value={value}
        onChange={onChange}
        marks={marks}
        min={from}
        max={to}
      />
    </div>
  );
};

export default Slider;
