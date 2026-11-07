import { useCallback } from 'react';
import { languages } from '../translations';
import { Flag } from './Flag';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from 'ui/select';
import { cn } from 'ui/cn';

interface LanguagePickerProps {
  value: string;
  variant?: 'outlined' | 'standard' | 'filled';
  small?: boolean;
  onChange: (value: string) => void;
}

const LanguagePicker = ({ value, small, onChange }: LanguagePickerProps) => {
  const handleSelect = useCallback(
    (language: string) => {
      onChange(language);
    },
    [onChange],
  );
  const current = languages.find((language) => language.locale === value);
  return (
    <Select value={value} onValueChange={handleSelect}>
      <SelectTrigger
        data-cy="language-picker"
        className={cn(small ? 'w-[7.5rem]' : 'w-64')}
        aria-label="Language"
      >
        <SelectValue>
          {current ? (
            <span className="flex items-center">
              <Flag country={current.iso} />
              {small ? null : <span>{current.name}</span>}
            </span>
          ) : null}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem
            value={language.locale}
            key={language.locale}
            data-cy={`language-picker-item-${language.locale}`}
          >
            <span className="flex items-center">
              <Flag country={language.iso} />
              <span className="flex flex-col text-xs">
                <span>{language.name}</span>
                <span className="text-muted">{language.englishName}</span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default LanguagePicker;
