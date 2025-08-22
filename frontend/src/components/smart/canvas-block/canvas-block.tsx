import { useRef, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { Stage, Layer } from "react-konva";
import {
  createObject,
  updateLastObject,
} from "@/core/store/slices/canvas-slice";
import { renderGraphicObject } from "@/components/simple/render-graphic-object";
import {
  selectActiveLayerId,
  selectActiveTool,
  selectActiveColor,
  selectLayers,
  selectVisibleObjects,
} from "@/core/store/selectors";

type Props = {
  width: number;
  height: number;
};

export const CanvasBlock = ({ width, height }: Props) => {
  const dispatch = useAppDispatch();
  const activeLayerId = useAppSelector(selectActiveLayerId);
  const activeTool = useAppSelector(selectActiveTool);
  const activeColor = useAppSelector(selectActiveColor);
  const layers = useAppSelector(selectLayers);
  const visibleElements = useAppSelector(selectVisibleObjects);

  const isDrawing = useRef(false);

  const getPointerPos = (e: any) => {
    const stage = e.target.getStage();
    return stage?.getPointerPosition() ?? null;
  };

  const handleMouseDown = useCallback(
    (e: any) => {
      if (!activeLayerId || !activeTool) return;
      const pos = getPointerPos(e);
      if (!pos) return;

      isDrawing.current = true;

      dispatch(
        createObject({
          tool: activeTool,
          color: activeColor,
          start: pos,
          layerId: activeLayerId,
        })
      );
    },
    [dispatch, activeTool, activeColor, activeLayerId]
  );

  const handleMouseMove = useCallback(
    (e: any) => {
      if (!activeTool || !isDrawing.current) return;
      const pos = getPointerPos(e);
      if (!pos) return;

      dispatch(updateLastObject({ to: pos }));
    },
    [dispatch, activeTool]
  );

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  return (
    <Stage
      width={width}
      height={height}
      draggable={false}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {layers.map((layer) => (
        <Layer key={layer.id} visible={layer.visible} opacity={layer.opacity}>
          {visibleElements
            .filter((el) => el.layerId === layer.id)
            .map((el) => renderGraphicObject(el))}
        </Layer>
      ))}
    </Stage>
  );
};
