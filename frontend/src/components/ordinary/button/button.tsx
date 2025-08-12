import type { IButtonProps } from '@/core/types/interfaces';

import styles from './button.module.scss';

export const Button = ({ 
  onClick, 
  children, 
  variant = 'primary' 
}: IButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={variant === 'primary' ? styles.primaryButton : styles.secondaryButton}
    >
      {children}
    </button>
  );
};