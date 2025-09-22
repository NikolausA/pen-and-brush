import { useCallback, useMemo } from "react";
import type { GraphicObject } from "@/core/types/interfaces/igraphic-objects";
import {
  isCircleObject,
  hasShapeFill,
} from "@/core/types/interfaces/igraphic-objects";
import type { Layer } from "@/core/types/interfaces/entities";

interface UseGraphicsDataProps {
  layersData: Layer[];
  draft: GraphicObject | null;
  activeLayer: Layer | undefined;
}

export const useGraphicsData = ({
  layersData,
  draft,
  activeLayer,
}: UseGraphicsDataProps) => {
  const enhanceGraphicObjectForCanvas = useCallback(
    (obj: GraphicObject): GraphicObject => {
      // Создаем копию объекта для избежания мутации
      const enhanced = { ...obj };

      // Специальная обработка для кругов - добавляем данные для Canvas рендеринга
      if (isCircleObject(enhanced)) {
        const radius = enhanced.radius || 0;
        const diameter = radius * 2;

        return {
          ...enhanced,
          centerX: enhanced.x,
          centerY: enhanced.y,
          // Для Canvas API нужны координаты левого верхнего угла и размеры
          x: enhanced.x - radius,
          y: enhanced.y - radius,
          width: diameter,
          height: diameter,
        };
      }

      // Для прямоугольников добавляем данные о stroke если нужно
      if (obj.type === "rect") {
        return {
          ...enhanced,
          // Убеждаемся что есть все необходимые поля
        };
      }

      return enhanced;
    },
    []
  );

  const visibleElements = useMemo((): GraphicObject[] => {
    // Проверяем входные данные
    if (!Array.isArray(layersData)) {
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
        return [];
      }

      return layerData
        .filter((obj) => obj && obj.id) // Фильтруем некорректные объекты
        .map((obj) => {
          const enhanced = enhanceGraphicObjectForCanvas(obj);

          return {
            ...enhanced,
            opacity: Math.max(0, Math.min(1, layer.opacity / 100)), // Нормализуем opacity в 0-1
            layerId: layer.id, // Добавляем информацию о слое
            layerOrder: layer.order, // Для правильной сортировки
            isDraft: false,
          } as GraphicObject;
        });
    });

    // Добавляем draft элемент если он существует и активный слой видим
    if (draft && activeLayer?.isVisible) {
      try {
        const enhanced = enhanceGraphicObjectForCanvas(draft);
        elements.push({
          ...enhanced,
          opacity: Math.max(0, Math.min(1, activeLayer.opacity / 100)),
          layerId: activeLayer.id,
          layerOrder: activeLayer.order,
          isDraft: true,
        } as GraphicObject);
      } catch (error) {
        console.warn("Error processing draft element:", error);
      }
    }

    // Сортируем элементы по порядку слоев (нижние слои рисуются первыми)
    return elements.sort((a, b) => {
      const orderA = a.layerOrder || 0;
      const orderB = b.layerOrder || 0;
      return orderA - orderB;
    });
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
      visibleLayers: layersData.filter((layer) => layer.isVisible).length,
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
