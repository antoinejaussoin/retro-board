import { useCallback } from 'react';
import { Slider } from 'ui/slider';

interface MaxPostsSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const UNLIMITED = 30;

const marks = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: UNLIMITED, label: 'Unlimited' },
];

const markValues = marks.map((mark) => mark.value);

function nearestMark(value: number) {
  return markValues.reduce((best, current) =>
    Math.abs(current - value) < Math.abs(best - value) ? current : best,
  );
}

const MaxPostsSlider = ({ value, onChange }: MaxPostsSliderProps) => {
  const handleChange = useCallback(
    (next: number) => {
      const snapped = nearestMark(next);
      onChange(snapped === UNLIMITED ? null : snapped);
    },
    [onChange],
  );

  return (
    <div className="pr-5">
      <Slider
        value={value === null ? UNLIMITED : value}
        onChange={handleChange}
        marks={marks}
        min={1}
        max={UNLIMITED}
      />
    </div>
  );
};

export default MaxPostsSlider;
