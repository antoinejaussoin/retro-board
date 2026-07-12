import styled from '@emotion/styled';
import { Mark } from '@mui/base';
import { Slider } from '@mui/material';
import { isProduction } from 'is-production';
import { useCallback } from 'react';

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

const marks: Mark[] = [
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
    (_event: Event, value: number | number[]) => {
      // Allows testing on a small duration in development mode
      if (!isProduction() && value === 1) {
        onChange(10);
        return;
      }
      onChange((value as number) * 60);
    },
    [onChange]
  );
  return (
    <Container>
      <Slider
        value={duration / 60}
        onChange={handleChange}
        marks={marks}
        min={1}
        max={60}
        step={1}
      />
    </Container>
  );
}

const Container = styled.div`
  padding-right: 20px;
`;
