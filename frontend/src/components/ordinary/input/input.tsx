import type { IInputProps } from '@/core/types/interfaces/iordinary/iinput';

import styles from './input.module.scss';

export const Input = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder,
  error
}: IInputProps) => {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className={`${styles.input} ${error ? styles.inputError : ''}`}
        placeholder={placeholder}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
};