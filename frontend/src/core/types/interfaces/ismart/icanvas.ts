import type Konva from 'konva';
import type { ReactNode } from 'react';

export interface ICanvasProps {
  width: number;
  height: number;
  getCursor: () => string;
  handleMouseDown: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  handleMouseMove: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  handleMouseUp: (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => void;
  children: ReactNode; 
}