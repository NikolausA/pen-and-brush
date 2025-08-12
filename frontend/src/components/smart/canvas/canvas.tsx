import { Stage } from 'react-konva';

import type { ICanvasProps } from '@/core/types/interfaces/ismart/icanvas';

import styles from './canvas.module.css';


export const Canvas = ({
  width,
  height,
  getCursor,
  handleMouseDown,
  handleMouseMove,
  handleMouseUp,
  children,
}: ICanvasProps) => {
  return (
    <div className={styles.container}>
      <Stage
        width={width}
        height={height}
        className={styles.stage}
        style={{ cursor: getCursor() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        {children}
      </Stage>
    </div>
  );
};
