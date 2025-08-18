export interface IToolsPanelProps {
  onToolSelect: (tool: string) => void;
  onColorSelect: (color: string) => void;
  activeTool: string;
  activeShape?: string;
  activeColor: string;
}

export interface IShapePanelProps {
  styles: Partial<{
    shapePanel: string;
    panelTitle: string;
    shapesRow: string;
    shapeButton: string;
    activeShape: string;
  }>;
  shapes: { name: string; icon: React.ReactNode; label: string }[];
  handleShapeSelect: (shape: string) => void;
  activeShape: string | undefined;
  activeTool: string;
}

export interface IColorPaletteProps {
  styles: Partial<{
    colorPalette: string;
    panelTitle: string;
    colorsGrid: string;
    colorButton: string;
    activeColor: string;
  }>
  colors: string[]
  handleColorSelect: (color: string) => void
  activeColor: string
}

export interface IToolsColumnProps {
  styles: Partial<{
    toolsColumn: string;
    toolsRow: string;
    toolButton: string;
    activeTool: string;
    active: string;
  }>;
  handleToolClick: (tool: string) => void;
  activeTool: string;
  activeShape?: string;
  activeColor: string;
  getShapeLabel: (shape: string) => string
}