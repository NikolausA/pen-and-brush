import { useState } from 'react';
import { 
  GripVertical
} from 'lucide-react';

import { getShapeLabel } from '@/core/utils/tools-panel-utils';
import { colors, shapes } from '@/core/constants/tools-panel-data';
import type { IToolsPanelProps } from '@/core/types/interfaces/ismart/itools-panel';

import styles from './tools-panel.module.scss';
import { ShapePanel } from './shape-panel';
import { ColorPalette } from './color-palette';
import { ToolsColumn } from './tools-column';


export const ToolsPanel = ({ 
  onToolSelect, 
  onColorSelect, 
  activeTool,
  activeShape,
  activeColor
}: IToolsPanelProps) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleShapeSelect = (shape: string) => {
    onToolSelect(shape);
    setShowShapePanel(false);
  };

  const handleToolClick = (tool: string) => {
    if (tool === 'shape') {
      setShowShapePanel(!showShapePanel);
      setShowColorPalette(false);
    } else if (tool === 'color') {
      setShowColorPalette(!showColorPalette);
      setShowShapePanel(false);
    } else {
      onToolSelect(tool);
      setShowShapePanel(false);
      setShowColorPalette(false);
    }
  };

  const handleColorSelect = (color: string) => {
    onColorSelect(color);
    setShowColorPalette(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget || (e.target as HTMLElement).closest(`.${styles.dragHandle}`)) {
      setIsDragging(true);
      const startX = e.clientX - position.x, startY = e.clientY - position.y;
      const handleMouseMove = (e: MouseEvent) => {
        setPosition({
          x: e.clientX - startX,
          y: e.clientY - startY
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  };

  return (
    <div
      className={`${styles.panel} ${isDragging ? styles.dragging : ''}`}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`
      }}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.dragHandle}>
        <GripVertical size={12} />
      </div>

      <ToolsColumn
        styles={styles}
        handleToolClick={handleToolClick}
        activeTool={activeTool}
        activeShape={activeShape}
        activeColor={activeColor}
        getShapeLabel={getShapeLabel}
      />

      <div className={styles.colorIndicator}>
        <div className={styles.colorSwatch} style={{ backgroundColor: activeColor }}/>
      </div>

      {showShapePanel && (
        <ShapePanel styles={styles} shapes={shapes} handleShapeSelect={handleShapeSelect} activeShape={activeShape} activeTool={activeTool}/>
      )}
      {showColorPalette && (
        <ColorPalette styles={styles} colors={colors} handleColorSelect={handleColorSelect} activeColor={activeColor} />
      )}
    </div>
  );
}