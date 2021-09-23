import { useCallback } from 'react';
import InputAdornment from '@mui/material/InputAdornment';
import TextField, { StandardTextFieldProps } from '@mui/material/TextField';

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
  );
};

export default Input;
