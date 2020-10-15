import React, { useCallback } from 'react';
import {
  Input as BaseInput,
  InputProps as BaseInputProps,
  InputAdornment,
} from '@material-ui/core';

interface InputProps extends BaseInputProps {
  onChangeValue: (value: string) => void;
  leftIcon?: JSX.Element;
}

const Input = ({ onChangeValue, leftIcon, ...props }: InputProps) => {
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value),
    [onChangeValue]
  );
  return (
    <BaseInput
      startAdornment={
        leftIcon ? (
          <InputAdornment position="start">{leftIcon}</InputAdornment>
        ) : undefined
      }
      {...props}
      onChange={handleUsernameChange}
    />
  );
};

export default Input;
