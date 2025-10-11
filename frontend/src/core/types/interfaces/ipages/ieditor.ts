export type DrawingElement = {
  id: string;
  type: "brush" | "rectangle" | "circle" | "triangle" | "eraser";
  points?: number[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
};

export type Layer = {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  elements: DrawingElement[];
};

export type HistoryItem = {
  id: string;
  description: string;
  state: Layer[];
  isAfterSelected?: boolean;
};

export interface ISliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}
