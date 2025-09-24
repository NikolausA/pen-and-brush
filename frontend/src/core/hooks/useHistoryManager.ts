// @ts-nocheck
import { useCallback } from "react";
import { useAddHistoryMutation } from "@/core/store/api";
import type { Layer, History } from "@/core/types/interfaces/entities";

interface HistoryActionData {
  layers?: Layer[];
  [key: string]: unknown;
}

export const useHistoryManager = (projectId: string) => {
  const [addHistory] = useAddHistoryMutation();

  const addToHistory = useCallback(
    async (action: string, payload: HistoryActionData) => {
      try {
        await addHistory({
          projectId,
          data: {
            action,
            data: payload,
            timestamp: new Date().toISOString()
          } as Partial<History>,
        }).unwrap();
        
        console.log('History added:', { action, projectId, payload });
      } catch (error) {
        console.error('Failed to add history:', error);
        // Не прерываем процесс рисования из-за ошибки истории
      }
    },
    [addHistory, projectId]
  );

  // Дополнительные утилиты для работы с историей
  const addLayerCreatedHistory = useCallback(
    (layerName: string, layers: Layer[]) => {
      addToHistory(`Создан слой: ${layerName}`, { layers });
    },
    [addToHistory]
  );

  const addLayerDeletedHistory = useCallback(
    (layerName: string, layers: Layer[]) => {
      addToHistory(`Удален слой: ${layerName}`, { layers });
    },
    [addToHistory]
  );

  const addDrawingHistory = useCallback(
    (toolName: string, layers: Layer[]) => {
      addToHistory(`Рисование: ${toolName}`, { layers });
    },
    [addToHistory]
  );

  const addLayerReorderedHistory = useCallback(
    (layers: Layer[]) => {
      addToHistory("Изменен порядок слоев", { layers });
    },
    [addToHistory]
  );

  return { 
    addToHistory,
    addLayerCreatedHistory,
    addLayerDeletedHistory, 
    addDrawingHistory,
    addLayerReorderedHistory
  };
};