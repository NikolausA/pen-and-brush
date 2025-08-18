import type { IColorPaletteProps } from "@/core/types/interfaces/ismart/itools-panel"


export const ColorPalette = ({
  styles,
  colors,
  handleColorSelect,
  activeColor
}: IColorPaletteProps) => {
  return <div className={styles.colorPalette}>
    <div className={styles.panelTitle}>Палитра цветов</div>
    <div className={styles.colorsGrid}>
      {colors.map(color => (
        <button
          key={color}
          className={`${styles.colorButton} ${
            activeColor === color ? styles.activeColor : ''
          }`}
          style={{ backgroundColor: color }}
          onClick={() => handleColorSelect(color)}
          title={color}
        />
      ))}
    </div>
  </div>
}