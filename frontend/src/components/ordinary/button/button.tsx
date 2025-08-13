import clsx from 'clsx';

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
      className={clsx({
        [styles.primaryButton]: variant === 'primary',
        [styles.secondaryButton]: variant === 'secondary',
        [styles.dangerButton]: variant === 'danger'
      })}
    >
      {children}
    </button>
  );
};
