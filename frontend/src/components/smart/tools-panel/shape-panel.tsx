import type { IShapePanelProps } from "@/core/types/interfaces/ismart/itools-panel"

export const ShapePanel = ({
  styles,
  shapes,
  handleShapeSelect,
  activeShape,
  activeTool
}: IShapePanelProps) => {
  return <div className={styles.shapePanel}>
    <div className={styles.panelTitle}>Фигуры</div>
    <div className={styles.shapesRow}>
      {shapes.map(shape => (
        <button
          key={shape.name}
          className={`${styles.shapeButton} ${
            activeShape === shape.name || activeTool === shape.name
              ? styles.activeShape 
              : ''
          }`}
          onClick={() => handleShapeSelect(shape.name)}
          title={shape.label}
        >
          {shape.icon}
        </button>
      ))}
    </div>
  </div>
}