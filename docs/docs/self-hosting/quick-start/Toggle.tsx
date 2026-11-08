import React from 'react';
import { Field, FieldProps } from './Field';
import styles from './Editor.module.css';

type ToggleProps = FieldProps & {
  id: string;
  toggleLabel: string;
  value: boolean;
  onChange: (value: boolean) => void;
};

export function FieldToggle({
  label,
  toggleLabel,
  description,
  value,
  id,
  onChange,
}: ToggleProps) {
  return (
    <Field label={label} description={description}>
      <div className={styles.toggle}>
        <input
          id={id}
          className={styles.switch}
          type="checkbox"
          role="switch"
          checked={value}
          onChange={(e) => onChange(e.target.checked)}
        />
        <label htmlFor={id} style={{ marginLeft: 10 }}>
          {toggleLabel}
        </label>
      </div>
    </Field>
  );
}
