import { Search } from '@material-ui/icons';
import Input from '../../components/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <Input onChangeValue={onChange} value={value} leftIcon={<Search />} />
    </div>
  );
}
