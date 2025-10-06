import { useCallback, useMemo } from "react";
import type {
  GraphicObject,
  RectObject,
  CircleObject,
  LineObject,
  FreePathObject,
} from "@/core/types/interfaces/igraphic-objects";
import {
  isCircleObject,
  hasShapeFill,
  isRectObject,
  isLineObject,
  isFreePathObject,
} from "@/core/types/interfaces/igraphic-objects";
import type { Layer } from "@/core/types/interfaces/entities";

interface UseGraphicsDataProps {
  layersData: Layer[] | undefined;
  draft: GraphicObject | null;
  activeLayer: Layer | null;
}

export const useGraphicsData = ({
  layersData,
  draft,
  activeLayer,
}: UseGraphicsDataProps) => {
  const enhanceGraphicObjectForCanvas = useCallback(
    (obj: GraphicObject): GraphicObject | null => {
      try {
        // Проверка валидности объекта
        if (!obj.id || !obj.type) {
          console.warn("Invalid graphic object:", obj);
          return null;
        }

        // Специальная обработка для кругов
        if (isCircleObject(obj)) {
          const radius = obj.radius || 0;
          if (radius <= 0) {
            console.warn("Invalid circle radius:", obj);
            return null;
          }
          const diameter = radius * 2;

          return {
            ...obj,
            centerX: obj.x ?? 0,
            centerY: obj.y ?? 0,
            x: (obj.x ?? 0) - radius,
            y: (obj.y ?? 0) - radius,
            width: diameter,
            height: diameter,
          } as CircleObject;
        }

        // Для прямоугольников проверяем размеры
        if (isRectObject(obj)) {
          if ((obj.width ?? 0) <= 0 || (obj.height ?? 0) <= 0) {
            console.warn("Invalid rectangle dimensions:", obj);
            return null;
          }
          return {
            ...obj,
            x: obj.x ?? 0,
            y: obj.y ?? 0,
            width: obj.width ?? 0,
            height: obj.height ?? 0,
          } as RectObject;
        }

        // Для линий проверяем точки
        if (isLineObject(obj)) {
          if (!Array.isArray(obj.points) || obj.points.length < 4) {
            console.warn("Invalid points for line:", obj);
            return null;
          }
          return {
            ...obj,
            points: [...obj.points],
          } as LineObject;
        }

        // Для свободных путей проверяем точки
        if (isFreePathObject(obj)) {
          if (!Array.isArray(obj.points) || obj.points.length < 2) {
            console.warn("Invalid points for freePath:", obj);
            return null;
          }
          return {
            ...obj,
            points: [...obj.points],
          } as FreePathObject;
        }

        return obj;
      } catch (error) {
        console.error("Error enhancing graphic object:", error, obj);
        return null;
      }
    },
    []
  );

  const visibleElements = useMemo((): GraphicObject[] => {
    // Проверяем входные данные
    if (!Array.isArray(layersData)) {
      console.warn("layersData is not an array:", layersData);
      return [];
    }

    const elements: GraphicObject[] = layersData.flatMap((layer) => {
      // Пропускаем невидимые слои
      if (!layer.isVisible) {
        return [];
      }

      // Проверяем наличие данных слоя
      const layerData = layer.data as GraphicObject[];
      if (!Array.isArray(layerData)) {
        console.warn(`Invalid layer data for layer ${layer.id}:`, layer.data);
        return [];
      }

      return layerData
        .map((obj) => enhanceGraphicObjectForCanvas(obj))
        .filter((obj): obj is GraphicObject => obj !== null)
        .map((obj) => ({
          ...obj,
          // ✅ ИСПРАВЛЕНО: Сохраняем opacity в формате 0-100, добавляем метаданные слоя
          opacity: obj.opacity ?? 100, // Сохраняем оригинальное значение объекта
          layerId: layer.id,
          layerOrder: layer.order ?? 0,
          isDraft: false,
        }));
    });

    // Добавляем draft элемент если он существует и активный слой видим
    if (draft && activeLayer?.isVisible) {
      const enhancedDraft = enhanceGraphicObjectForCanvas(draft);
      if (enhancedDraft) {
        elements.push({
          ...enhancedDraft,
          opacity: enhancedDraft.opacity ?? 100, // Сохраняем оригинальное значение
          layerId: activeLayer.id,
          layerOrder: activeLayer.order ?? 0,
          isDraft: true,
        });
      } else {
        console.warn("Invalid draft element skipped:", draft);
      }
    }

    // Сортируем элементы по порядку слоев (снизу вверх)
    const sorted = elements.sort((a, b) => {
      const orderA = a.layerOrder ?? 0;
      const orderB = b.layerOrder ?? 0;
      return orderA - orderB;
    });

    console.log("📊 useGraphicsData result:", {
      totalElements: sorted.length,
      byLayer: sorted.reduce((acc, el) => {
        const key = el.layerId;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    });

    return sorted;
  }, [layersData, draft, activeLayer, enhanceGraphicObjectForCanvas]);

  // Дополнительные утилитарные функции
  const getElementsForLayer = useCallback(
    (layerId: string): GraphicObject[] => {
      return visibleElements.filter((element) => element.layerId === layerId);
    },
    [visibleElements]
  );

  const getElementsByType = useCallback(
    (type: GraphicObject["type"]): GraphicObject[] => {
      return visibleElements.filter((element) => element.type === type);
    },
    [visibleElements]
  );

  const getShapeElements = useCallback((): GraphicObject[] => {
    return visibleElements.filter(hasShapeFill);
  }, [visibleElements]);

  const getPathElements = useCallback((): GraphicObject[] => {
    return visibleElements.filter(
      (el) => el.type === "line" || el.type === "freePath"
    );
  }, [visibleElements]);

  const getDraftElement = useCallback((): GraphicObject | null => {
    return visibleElements.find((el) => el.isDraft) || null;
  }, [visibleElements]);

  // Статистика
  const statistics = useMemo(
    () => ({
      totalElements: visibleElements.length,
      visibleLayers: layersData?.filter((layer) => layer.isVisible).length ?? 0,
      elementsByType: {
        brush: visibleElements.filter(
          (el) => el.type === "freePath" && el.strokeColor !== "#ffffff"
        ).length,
        eraser: visibleElements.filter(
          (el) => el.type === "freePath" && el.strokeColor === "#ffffff"
        ).length,
        line: visibleElements.filter((el) => el.type === "line").length,
        rectangle: visibleElements.filter((el) => el.type === "rect").length,
        circle: visibleElements.filter((el) => el.type === "circle").length,
      },
      hasDraft: visibleElements.some((el) => el.isDraft),
    }),
    [visibleElements, layersData]
  );

  return {
    visibleElements,
    enhanceGraphicObjectForCanvas,
    getElementsForLayer,
    getElementsByType,
    getShapeElements,
    getPathElements,
    getDraftElement,
    statistics,
  };
};
