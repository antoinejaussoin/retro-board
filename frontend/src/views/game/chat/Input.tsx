import { Plus } from 'lucide-react';
import React, { useCallback, useState } from 'react';
import { IconButton } from 'ui/icon-button';

type InputProps = {
  cy?: string;
  placeholder?: string;
  onNewMessage: (value: string) => void;
};

function isEnter(code: string) {
  return code === 'Enter' || code === 'NumpadEnter';
}

export default function Input({
  placeholder,
  onNewMessage: onAdd,
  cy,
}: InputProps) {
  const [value, setValue] = useState('');
  const [valid, setValid] = useState(false);

  const handleChange = useCallback(
    (evt: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = evt.target.value;
      setValid(false);
      setValue(newValue);
      const isValid = !!newValue.length;
      setValid(isValid);
    },
    [],
  );

  const handleAdd = useCallback(() => {
    if (valid) {
      onAdd(value);
      setValue('');
      setValid(false);
    }
  }, [onAdd, value, valid]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (isEnter(event.nativeEvent.code) && !event.nativeEvent.shiftKey) {
        event.stopPropagation();
        event.preventDefault();
        handleAdd();
      }
    },
    [handleAdd],
  );

  return (
    <div className="flex items-end gap-1 border-t border-line px-2 py-2">
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={handleChange}
        onKeyDown={handleKeyPress}
        data-cy={cy}
        rows={2}
        className="max-h-32 min-h-10 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink outline-none placeholder:text-muted"
      />
      <IconButton
        aria-label="Send message"
        onClick={handleAdd}
        disabled={!valid}
        className="size-9"
      >
        <Plus className="size-4" />
      </IconButton>
    </div>
  );
}
