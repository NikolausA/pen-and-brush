// @ts-nocheck
import type { ISliderProps } from '@/core/types/interfaces/ipages/ieditor';
import styles from './slider.module.scss';

export const Slider = ({ min = 0, max = 100, step, value, onChange }: ISliderProps) => {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className={styles.sliderContainer} style={{ '--value-percentage': `${percentage}%`, '--value': value, '--min': min, '--max': max }}>
      <div className={styles.valueLabel}>{value}</div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className={styles.slider}
      />
    </div>
  );
};