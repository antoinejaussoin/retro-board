import { Checkbox } from 'ui/checkbox';

interface BooleanOptionProps {
  value: boolean;
  onChange: (value: boolean) => void;
}

const BooleanOption = ({ value, onChange }: BooleanOptionProps) => {
  return <Checkbox checked={value} onCheckedChange={onChange} />;
};

export default BooleanOption;
