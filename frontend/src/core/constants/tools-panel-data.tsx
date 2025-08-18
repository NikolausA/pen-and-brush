import { 
  Square,
  Circle,
  Triangle,
  Brush,
  Eraser,
  Minus,
  Palette
} from 'lucide-react';

export const colors = [
  '#000000', '#FFFFFF', '#FF0000', '#00FF00', 
  '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF',
  '#800000', '#008000', '#000080', '#800080',
  '#FFA500', '#FFC0CB', '#A52A2A', '#808080'
];

export const getTools = ({activeShape, activeColor, getShapeLabel, activeTool}: {
  activeShape: string | undefined | null,
  activeColor: string ,
  getShapeLabel: (shape: string ) => string,
  activeTool: string 
}) => {
  const tools = [
    { name: 'brush', icon: <Brush size={16} />, label: 'Кисть' },
    { name: 'eraser', icon: <Eraser size={16} />, label: 'Ластик' },
    { name: 'line', icon: <Minus size={16} />, label: 'Линия' },
    { 
      name: 'shape', 
      icon: activeShape === 'circle' ? <Circle size={16} /> : 
            activeShape === 'rectangle' ? <Square size={16} /> : 
            activeShape === 'triangle' ? <Triangle size={16} /> : 
            <Square size={16} />, 
      label: `Фигуры ${activeShape ? `(${getShapeLabel(activeShape)})` : ''}`,
      isActive: activeTool === 'shape' || ['rectangle', 'circle', 'triangle'].includes(activeTool)
    },
    { 
      name: 'color', 
      icon: <Palette size={16} />, 
      label: 'Цвет',
      style: { color: activeColor === '#FFFFFF' ? '#000000' : activeColor, backgroundColor: activeColor }
    }
  ];  
  return tools;
}


export const shapes = [
  { name: 'rectangle', icon: <Square size={16} />, label: 'Прямоугольник' },
  { name: 'circle', icon: <Circle size={16} />, label: 'Круг' },
  { name: 'triangle', icon: <Triangle size={16} />, label: 'Треугольник' }
];

