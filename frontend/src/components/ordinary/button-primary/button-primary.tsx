import { FaArrowRight } from 'react-icons/fa';

import type { IButtonPrimaryProps } from '@/core/types/interfaces';

import styles from './button-primary.module.scss';


export const ButtonPrimary = ({ text, onClick }: IButtonPrimaryProps) => {
  return (
    <button className={styles.button} onClick={onClick}>
      <span className={styles.buttonText}>{text}</span>
      <span className={styles.buttonIcon}>
        <FaArrowRight size={20} />
      </span>
    </button>
  );
};