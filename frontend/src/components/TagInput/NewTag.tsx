import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { IconButton } from 'ui/icon-button';
import { Input } from 'ui/input';

type NewTagProps = {
  placeholder?: string;
  onAdd: (value: string) => void;
  onValidate: (value: string) => Promise<boolean>;
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

export default function NewTag({
  placeholder,
  onAdd,
  onValidate,
}: NewTagProps) {
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);

  const handleChange = useCallback(
    async (evt: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = evt.target.value;
      setValid(false);
      setValue(newValue);
      const isValid = (await onValidate(newValue)) && !!newValue.length;
      setValid(isValid);
    },
    [onValidate],
  );

  const handleAdd = useCallback(() => {
    if (valid) {
      onAdd(value);
      setValue('');
      setValid(false);
    }
  }, [onAdd, value, valid]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (isEnter(event.nativeEvent.code) && !event.nativeEvent.shiftKey) {
        handleAdd();
      }
    },
    [handleAdd],
  );

  return (
    <span className="relative inline-flex min-w-48 items-center">
      <Input
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
        className="pr-10"
      />
      <IconButton
        aria-label="add new pro user email"
        onClick={handleAdd}
        disabled={!valid}
        className="absolute right-0"
      >
        <Plus className="size-4" />
      </IconButton>
    </span>
  );
}
