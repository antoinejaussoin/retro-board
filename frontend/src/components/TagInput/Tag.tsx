import { Chip } from '@mui/material';

type TagProps = {
  value: string;
  onDelete?: (value: string) => void;
};

export default function Tag({ value, onDelete }: TagProps) {
  return (
    <Chip
      label={value}
      onDelete={onDelete ? () => onDelete(value) : undefined}
    />
  );
}
