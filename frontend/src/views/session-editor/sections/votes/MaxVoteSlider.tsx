import { useCallback } from 'react';
import styled from '@emotion/styled';
import Slider from '@mui/material/Slider';
import { Mark } from '@mui/base';

interface MaxVoteSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const UNLIMITED = 6; // Arbitrary value, translated to null anyway

const marks: Mark[] = [
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
    (_event: Event, value: number | number[]) =>
      onChange(value === UNLIMITED ? null : (value as number)),
    [onChange]
  );
  return (
    <Container>
      <Slider
        value={value === null ? UNLIMITED : (value as number)}
        onChange={handleChange}
        marks={marks}
        min={0}
        max={UNLIMITED}
      />
    </Container>
  );
};

const Container = styled.div`
  padding-right: 20px;
`;

export default MaxVoteSlider;
