// @ts-nocheck
import { useCallback } from "react";
import { useAddHistoryMutation } from "@/core/store/api";
import type { Layer } from "@/core/types/interfaces/entities";

interface HistoryActionData {
  layers?: Layer[];
  [key: string]: unknown;
}

export const useHistoryManager = (projectId: string) => {
  const [addHistory] = useAddHistoryMutation();

  const addToHistory = useCallback(
    async (action: string, payload: HistoryActionData) => {
      console.log(
        "💾 [HISTORY] Saving snapshot:",
        action,
        "Layer 0 objects count:",
        payload.layers?.[0]?.data?.length || 0
      );
      console.log(
        "💾 [HISTORY] Object IDs in snapshot:",
        payload.layers?.[0]?.data?.map((o: any) => o.id) || []
      );

      try {
        // ✅ ИСПРАВЛЕНО: Обертка { layers: [...] } для совместимости с бэкенд JSONB
        await addHistory({
          projectId,
          data: {
            action,
            layerId: payload.layerId || null,
            data: { layers: payload.layers || [] }, // Обертка для бэкенда
            timestamp: new Date().toISOString(),
          },
        }).unwrap();

        console.log("✅ [HISTORY] Snapshot saved successfully");
      } catch (error) {
        console.error("❌ [HISTORY] Failed to save snapshot:", error);
      }
    },
    [addHistory, projectId]
  );

  // Утилиты для различных типов действий
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
    addLayerReorderedHistory,
  };
};
