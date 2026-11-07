import { Search } from 'lucide-react';
import Input from '../../components/Input';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <Input
      onChangeValue={onChange}
      value={value}
      leftIcon={<Search className="size-4" />}
      aria-label="Search"
      className="h-9 w-40 sm:w-56"
    />
  );
}
