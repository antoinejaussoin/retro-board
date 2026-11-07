import { useCallback } from 'react';
import { isProduction } from 'is-production';
import { Slider } from 'ui/slider';

type DurationSelectionProps = {
  /**
   * Duration in seconds
   */
  duration: number;
  /**
   * @param duration Duration in seconds
   */
  onChange: (duration: number) => void;
};

const marks = [
  { value: 1, label: '1m' },
  { value: 15, label: '15m' },
  { value: 30, label: '30m' },
  { value: 45, label: '45m' },
  { value: 60, label: '1h' },
];

export default function DurationSelection({
  duration,
  onChange,
}: DurationSelectionProps) {
  const handleChange = useCallback(
    (value: number) => {
      if (!isProduction() && value === 1) {
        onChange(10);
        return;
      }
      onChange(value * 60);
    },
    [onChange],
  );

  const minutes = duration / 60;
  const sliderValue = Math.min(60, Math.max(1, minutes));

  return (
    <div className="pr-5">
      <Slider
        value={sliderValue}
        onChange={handleChange}
        marks={marks}
        min={1}
        max={60}
      />
    </div>
  );
}
