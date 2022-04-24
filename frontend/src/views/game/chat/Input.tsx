import { Add } from '@mui/icons-material';
import { IconButton, Input as BaseInput, InputAdornment } from '@mui/material';
import React, { useCallback, useState } from 'react';

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
    async (evt: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const newValue = evt.target.value;
      setValid(false);
      setValue(newValue);
      const isValid = !!newValue.length;
      setValid(isValid);
    },
    []
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
        event.stopPropagation();
        event.preventDefault();
        handleAdd();
      }
    },
    [handleAdd]
  );

  return (
    <BaseInput
      value={value}
      placeholder={placeholder}
      onChange={handleChange}
      onKeyPress={handleKeyPress}
      style={{ border: 'none', outline: 'none', margin: 10 }}
      multiline
      inputProps={{ 'data-cy': cy }}
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
