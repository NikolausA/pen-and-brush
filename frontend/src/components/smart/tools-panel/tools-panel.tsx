import { useState, useRef, useEffect } from "react";
import { GripVertical } from 'lucide-react';

import { getShapeLabel } from "@/core/utils/tools-panel-utils";
import { colors, shapes } from "@/core/constants/tools-panel-data";
import type { IToolsPanelProps } from "@/core/types/interfaces/ismart/itools-panel";

import styles from "./tools-panel.module.scss";
import { ShapePanel } from "./shape-panel";
import { ColorPalette } from "./color-palette";
import { ToolsColumn } from "./tools-column";

export const ToolsPanel = ({
  onToolSelect,
  onColorSelect,
  activeTool,
  activeShape,
  activeColor,
}: IToolsPanelProps) => {
  const [position, setPosition] = useState({ x: 20, y: 100 });
  const [showShapePanel, setShowShapePanel] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Фиксация позиции при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      if (panelRef.current) {
        const panelRect = panelRef.current.getBoundingClientRect();
        const maxX = window.innerWidth - panelRect.width - 20;
        const maxY = window.innerHeight - panelRect.height - 20;
        
        setPosition(prev => ({
          x: Math.min(Math.max(prev.x, 20), maxX),
          y: Math.min(Math.max(prev.y, 20), maxY)
        }));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleShapeSelect = (shape: string) => {
    onToolSelect(shape);
    setShowShapePanel(false);
  };

  const handleToolClick = (tool: string) => {
    if (tool === "shape") {
      setShowShapePanel(!showShapePanel);
      setShowColorPalette(false);
    } else if (tool === "color") {
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
    // Проверяем что клик по области перетаскивания
    const target = e.target as HTMLElement;
    if (target.closest(`.${styles.dragHandle}`) || target === e.currentTarget) {
      e.preventDefault();
      e.stopPropagation();
      
      setIsDragging(true);
      const rect = panelRef.current?.getBoundingClientRect();
      if (!rect) return;

      const startX = e.clientX - rect.left;
      const startY = e.clientY - rect.top;

      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        const newX = e.clientX - startX;
        const newY = e.clientY - startY;
        
        // Ограничиваем позицию границами экрана
        const maxX = window.innerWidth - (rect.width || 56) - 20;
        const maxY = window.innerHeight - (rect.height || 400) - 20;
        
        setPosition({
          x: Math.min(Math.max(newX, 20), maxX),
          y: Math.min(Math.max(newY, 20), maxY)
        });
      };

      const handleMouseUp = () => {
        setIsDragging(false);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
  };

  return (
    <div
      ref={panelRef}
      className={`${styles.panel} ${isDragging ? styles.dragging : ""}`}
      style={{
        position: 'fixed', // Используем fixed вместо absolute
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1, // Высокий z-index
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
        <div
          className={styles.colorSwatch}
          style={{ backgroundColor: activeColor }}
        />
      </div>

      {showShapePanel && (
        <ShapePanel
          styles={styles}
          shapes={shapes}
          handleShapeSelect={handleShapeSelect}
          activeShape={activeShape}
          activeTool={activeTool}
        />
      )}
      {showColorPalette && (
        <ColorPalette
          styles={styles}
          colors={colors}
          handleColorSelect={handleColorSelect}
          activeColor={activeColor}
        />
      )}
    </div>
  );
};