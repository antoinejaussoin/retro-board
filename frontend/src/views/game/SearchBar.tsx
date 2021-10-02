import { Search } from '@mui/icons-material';
import Input from '../../components/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div>
      <Input
        onChangeValue={onChange}
        value={value}
        leftIcon={<Search />}
        variant="standard"
      />
    </div>
  );
}
