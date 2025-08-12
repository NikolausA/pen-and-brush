import type { IInputProps } from '@/core/types/interfaces/iordinary/iinput';

import styles from './input.module.scss';

export const Input = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder 
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
        className={styles.input}
        placeholder={placeholder}
      />
    </div>
  );
};