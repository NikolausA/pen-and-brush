import { useState, useCallback } from "react";
import {
  useGetHistoryQuery,
  useUpdateLayerMutation,
  useDeleteHistoryMutation,
  useGetLayersQuery,
} from "@/core/store/api";
import { HistoryList } from "@/components/smart";
import type { Layer, History } from "@/core/types/interfaces/entities";
import { computeDiffAndDeleteObjects } from "@/core/utils/historyDiff";

interface HistoryPanelProps {
  projectId: string;
}

export const EnhancedHistoryPanel = ({ projectId }: HistoryPanelProps) => {
  const {
    data: historyDataRaw = [],
    isLoading,
    refetch,
  } = useGetHistoryQuery(projectId);

  // КРИТИЧНО: Инвертируем массив (бэкенд возвращает DESC, нам нужен ASC)
  const historyData = [...historyDataRaw].reverse();

  const { data: currentLayers = [], refetch: refetchLayers } =
    useGetLayersQuery(projectId);

  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(
    null
  );
  const [updateLayer] = useUpdateLayerMutation();
  const [deleteHistory] = useDeleteHistoryMutation();

  console.log("🔧 [PANEL] EnhancedHistoryPanel rendered");
  console.log("🔧 [PANEL] History items count:", historyData.length);

  // Парсинг layers из JSONB структуры бэкенда
  const parseLayers = useCallback((data: any): Layer[] => {
    if (data && typeof data === "object" && Array.isArray(data.layers))
      return data.layers;
    if (Array.isArray(data)) return data;
    return [];
  }, []);

  // 🔄 Восстановление состояния
  const restoreHistoryState = useCallback(
    async (historyItem: History) => {
      console.log("🔄 [RESTORE] Called for:", historyItem.action);
      if (!historyItem) return;

      try {
        const layers = parseLayers(historyItem.data);

        if (!layers.length) {
          console.warn("No valid layers found in history entry:", historyItem);
          return;
        }

        console.log(
          `🔄 [RESTORE] Restoring history state with ${layers.length} layers`
        );

        await Promise.all(
          layers.map((layer) =>
            updateLayer({
              layerId: layer.id,
              projectId,
              data: {
                name: layer.name,
                order: layer.order,
                isVisible: layer.isVisible,
                opacity: layer.opacity,
                data: layer.data,
              },
            }).unwrap()
          )
        );

        await refetchLayers();

        setSelectedHistoryId(historyItem.id);
        console.log(`✅ [RESTORE] History state restored: ${historyItem.id}`);
      } catch (error) {
        console.error("❌ [RESTORE] Error restoring history state:", error);
        setSelectedHistoryId(null);
      }
    },
    [updateLayer, projectId, parseLayers, refetchLayers]
  );

  // 🗑 Удаление истории и объектов
  const handleDeleteHistoryItem = useCallback(
    async (historyItem: History) => {
      console.log("🗑 [DELETE HANDLER] Called for:", historyItem.action);
      if (!historyItem) return;

      try {
        const deletedIndex = historyData.findIndex(
          (h) => h.id === historyItem.id
        );

        console.log("🗑 [DELETE] Deleting history ID:", historyItem.id);
        console.log("🗑 [DELETE] Index in history array:", deletedIndex);
        console.log("🗑 [DELETE] Total history items:", historyData.length);

        const parsedDeletedLayers = parseLayers(historyItem.data);

        if (deletedIndex === 0) {
          console.log("🗑 [FIRST] Clearing all layers (index 0)");
          await Promise.all(
            currentLayers.map((layer) =>
              updateLayer({
                layerId: layer.id,
                projectId,
                data: {
                  name: layer.name,
                  order: layer.order,
                  isVisible: layer.isVisible,
                  opacity: layer.opacity,
                  data: [],
                },
              }).unwrap()
            )
          );
          setSelectedHistoryId(null);
        } else {
          const prevHistory = historyData[deletedIndex - 1];
          const parsedPrevLayers = parseLayers(prevHistory.data);

          console.log("🔍 [DIFF] Computing diff between snapshots");
          console.log(
            "🔍 [DIFF] Prev objects:",
            parsedPrevLayers[0]?.data?.length || 0
          );
          console.log(
            "🔍 [DIFF] Deleted objects:",
            parsedDeletedLayers[0]?.data?.length || 0
          );

          const diffSuccess = await computeDiffAndDeleteObjects(
            parsedPrevLayers,
            parsedDeletedLayers,
            currentLayers,
            updateLayer,
            projectId
          );

          if (diffSuccess) {
            console.log("✅ [DIFF] Objects deleted via diff");
          } else {
            console.warn("⚠️ [DIFF] No objects to delete (empty diff)");
          }

          setSelectedHistoryId(prevHistory.id);
        }

        console.log("🔄 [REFRESH] Refetching layers...");
        await refetchLayers();

        const freshLayers = await refetchLayers().unwrap();
        console.log(
          "✅ [REFRESH] Fresh data from DB:",
          freshLayers[0]?.data?.map((o: any) => o.id) || []
        );

        await deleteHistory({ historyId: historyItem.id, projectId }).unwrap();
        await refetch();

        console.log("✅ [SUCCESS] History item deleted:", historyItem.id);
      } catch (error) {
        console.error("❌ [ERROR] Failed to delete history item:", error);
      }
    },
    [
      deleteHistory,
      projectId,
      historyData,
      currentLayers,
      updateLayer,
      refetch,
      refetchLayers,
      parseLayers,
    ]
  );

  console.log(
    "🔧 [PANEL] Passing handleDeleteHistoryItem:",
    typeof handleDeleteHistoryItem
  );

  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: "center" }}>
        Загрузка истории...
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div
        style={{
          padding: 16,
          textAlign: "center",
          color: "#8B949E",
          fontSize: "14px",
        }}
      >
        История изменений пуста
      </div>
    );
  }

  return (
    <HistoryList
      history={historyData}
      selectedId={selectedHistoryId}
      onHistoryClick={restoreHistoryState}
      onHistoryDelete={handleDeleteHistoryItem}
    />
  );
};
