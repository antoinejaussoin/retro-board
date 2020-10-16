import React, { useCallback } from 'react';
import {
  InputAdornment,
  TextField,
  StandardTextFieldProps,
} from '@material-ui/core';

interface InputProps extends StandardTextFieldProps {
  onChangeValue: (value: string) => void;
  leftIcon?: JSX.Element;
}

const Input = ({ onChangeValue, leftIcon, ...props }: InputProps) => {
  const handleUsernameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value),
    [onChangeValue]
  );
  return (
    <TextField
      InputProps={
        leftIcon
          ? {
              startAdornment: (
                <InputAdornment position="start">{leftIcon}</InputAdornment>
              ),
            }
          : undefined
      }
      {...props}
      onChange={handleUsernameChange}
    />
    // <BaseInput
    //   startAdornment={
    //     leftIcon ? (
    //       <InputAdornment position="start">{leftIcon}</InputAdornment>
    //     ) : undefined
    //   }
    //   {...props}
    //   onChange={handleUsernameChange}
    // />
    // </TextField>
  );
};

export default Input;
