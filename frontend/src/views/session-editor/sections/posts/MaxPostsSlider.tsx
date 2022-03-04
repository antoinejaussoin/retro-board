import { useCallback } from 'react';
import styled from '@emotion/styled';
import Slider from '@mui/material/Slider';
import { Mark } from '@mui/base';

interface MaxPostsSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const UNLIMITED = 30; // Arbitrary value, translated to null anyway

const marks: Mark[] = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 5, label: '5' },
  { value: 10, label: '10' },
  { value: 15, label: '15' },
  { value: 20, label: '20' },
  { value: UNLIMITED, label: 'Unlimited' },
];

const MaxPostsSlider = ({ value, onChange }: MaxPostsSliderProps) => {
  const handleChange = useCallback(
    (_event: unknown, value: number | number[]) =>
      onChange(value === UNLIMITED ? null : (value as number)),
    [onChange]
  );
  return (
    <Container>
      <Slider
        value={value === null ? UNLIMITED : (value as number)}
        onChange={handleChange}
        marks={marks}
        min={1}
        step={null}
        max={UNLIMITED}
      />
    </Container>
  );
};

const Container = styled.div`
  padding-right: 20px;
`;

export default MaxPostsSlider;
