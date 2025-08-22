import type {
  BrushObject,
  EraserObject,
  LineObject,
  CircleObject,
  RectObject,
  GraphicObject,
} from "@/core/types/interfaces";

export function updateGraphicObject(
  object: GraphicObject,
  to: { x: number; y: number }
): GraphicObject {
  switch (object.type) {
    case "brush":
    case "eraser": {
      const o = object as BrushObject | EraserObject;
      return {
        ...o,
        props: {
          ...o.props,
          points: [...o.props.points, to.x, to.y],
        },
      };
    }

    case "line": {
      const o = object as LineObject;
      return {
        ...o,
        props: {
          ...o.props,
          x2: to.x,
          y2: to.y,
        },
      };
    }

    case "circle": {
      const o = object as CircleObject;
      const radius = Math.sqrt(
        Math.pow(to.x - o.props.x, 2) + Math.pow(to.y - o.props.y, 2)
      );
      return {
        ...o,
        props: {
          ...o.props,
          radius,
        },
      };
    }

    case "rect": {
      const o = object as RectObject;
      return {
        ...o,
        props: {
          ...o.props,
          width: to.x - o.props.x,
          height: to.y - o.props.y,
        },
      };
    }

    default: {
      const _exhaustiveCheck: never = object;
      return _exhaustiveCheck;
    }
  }
}
