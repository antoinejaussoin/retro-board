import { Add } from '@mui/icons-material';
import { IconButton, Input, InputAdornment } from '@mui/material';
import React, { useCallback, useState } from 'react';

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
    async (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = evt.target.value;
      setValid(false);
      setValue(newValue);
      const isValid = (await onValidate(newValue)) && !!newValue.length;
      setValid(isValid);
    },
    [onValidate]
  );

  const handleAdd = useCallback(() => {
    if (valid) {
      onAdd(value);
      setValue('');
      setValid(false);
    }
  }, [onAdd, value, valid]);

  const handleKeyPress = useCallback(
    (event: React.KeyboardEvent<unknown>) => {
      if (isEnter(event.nativeEvent.code) && !event.nativeEvent.shiftKey) {
        handleAdd();
      }
    },
    [handleAdd]
  );

  return (
    <Input
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      endAdornment={
        <InputAdornment position="end">
          <IconButton
            aria-label="add new pro user email"
            onClick={handleAdd}
            edge="end"
            disabled={!valid}
          >
            <Add />
          </IconButton>
        </InputAdornment>
      }
    />
  );
}
