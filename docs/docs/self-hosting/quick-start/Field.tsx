import React from 'react';
import styles from './Field.module.css';

export type FieldProps = {
  label: string;
  description?: string;
};

type InputFieldProps = FieldProps & {
  value: string;
  number?: boolean;
  onChange: (value: string) => void;
};

function onlyAlpha(e: React.KeyboardEvent<HTMLInputElement>) {
  const re = /[0-9A-Za-z\-@_\.]+/g;
  if (!re.test(e.key)) {
    e.preventDefault();
  }
}

function onlyNumbers(e: React.KeyboardEvent<HTMLInputElement>) {
  const re = /[0-9]+/g;
  if (!re.test(e.key)) {
    e.preventDefault();
  }
}

export function InputField({
  value,
  label,
  description,
  number,
  onChange,
}: InputFieldProps) {
  return (
    <Field label={label} description={description}>
      <input
        className={styles.input}
        value={value}
        onKeyPress={number ? onlyNumbers : onlyAlpha}
        onChange={(e) => onChange(e.target.value)}
      />
    </Field>
  );
}

export function Field({
  label,
  description,
  children,
}: React.PropsWithChildren<FieldProps>) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      {description ? (
        <div className={styles.description}>{description}</div>
      ) : null}
      {children}
    </div>
  );
}
