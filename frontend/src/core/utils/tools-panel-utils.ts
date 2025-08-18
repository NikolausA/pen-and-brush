export const getShapeLabel = (shape: string) => {
    switch(shape) {
      case 'rectangle': return 'Прямоугольник';
      case 'circle': return 'Круг';
      case 'triangle': return 'Треугольник';
      default: return '';
    }
}