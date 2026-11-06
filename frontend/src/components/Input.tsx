import type { InputHTMLAttributes, ReactNode } from 'react';
import { useCallback } from 'react';
import { Field, Input as TextInput } from 'ui/input';

interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChangeValue: (value: string) => void;
  leftIcon?: ReactNode;
  title?: string;
  fullWidth?: boolean;
}

const Input = ({
  onChangeValue,
  leftIcon,
  title,
  fullWidth,
  className,
  ...props
}: InputProps) => {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => onChangeValue(e.target.value),
    [onChangeValue],
  );
  return (
    <Field label={title} className={fullWidth ? 'w-full' : undefined}>
      <span className="relative flex items-center">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 text-muted">
            {leftIcon}
          </span>
        ) : null}
        <TextInput
          {...props}
          className={leftIcon ? `pl-10 ${className ?? ''}` : className}
          onChange={handleChange}
        />
      </span>
    </Field>
  );
};

export default Input;
