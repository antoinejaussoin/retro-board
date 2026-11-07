import { useCallback } from 'react';
import { Slider } from 'ui/slider';

interface MaxVoteSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const UNLIMITED = 6;

const marks = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
  { value: UNLIMITED, label: 'Unlimited' },
];

const MaxVoteSlider = ({ value, onChange }: MaxVoteSliderProps) => {
  const handleChange = useCallback(
    (next: number) => onChange(next === UNLIMITED ? null : next),
    [onChange],
  );

  return (
    <div className="pr-5">
      <Slider
        value={value === null ? UNLIMITED : value}
        onChange={handleChange}
        marks={marks}
        min={0}
        max={UNLIMITED}
      />
    </div>
  );
};

export default MaxVoteSlider;
