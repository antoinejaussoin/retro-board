import { Chip } from 'ui/chip';

type TagProps = {
  value: string;
  onDelete?: (value: string) => void;
};

export default function Tag({ value, onDelete }: TagProps) {
  return (
    <Chip onDelete={onDelete ? () => onDelete(value) : undefined}>{value}</Chip>
  );
}
