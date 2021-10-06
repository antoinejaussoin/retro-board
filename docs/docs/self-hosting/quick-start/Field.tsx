import React from 'react';
import styles from './Field.module.css';

type FieldProps = {
  value: string;
  label: string;
  description?: string;
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

export default function Field({
  value,
  label,
  description,
  number,
  onChange,
}: FieldProps) {
  return (
    <div className={styles.container}>
      <div className={styles.label}>{label}</div>
      {description ? (
        <div className={styles.description}>{description}</div>
      ) : null}
      <input
        className={styles.input}
        value={value}
        onKeyPress={number ? onlyNumbers : onlyAlpha}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
