import { getTools } from "@/core/constants/tools-panel-data";
import type { IToolsColumnProps } from "@/core/types/interfaces/ismart/itools-panel"


export const ToolsColumn = ({
  styles,
  handleToolClick,
  activeTool,
  activeShape,
  activeColor,
  getShapeLabel
}: IToolsColumnProps) => {
  const tools = getTools({ activeShape, activeColor, getShapeLabel, activeTool });

  return  <div className={styles.toolsColumn}>
    {tools.map(tool => (
      <button
        key={tool.name}
        className={`${styles.toolButton} ${
          (tool.isActive !== undefined ? tool.isActive : activeTool === tool.name)
            ? styles.active 
            : ''
        }`}
        onClick={() => handleToolClick(tool.name)}
        title={tool.label}
        style={tool.style }
      >
        {tool.icon}
      </button>
    ))}
  </div>
}