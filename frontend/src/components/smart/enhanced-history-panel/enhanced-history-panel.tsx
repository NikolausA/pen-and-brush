// @ts-nocheck
import { useState, useCallback } from "react";
import { useGetHistoryQuery, useUpdateLayerMutation, useDeleteHistoryMutation } from "@/core/store/api";
import { HistoryList } from "@/components/smart";
import type { Layer } from "@/core/types/interfaces/entities";

interface HistoryPanelProps {
  projectId: string;
}

export const EnhancedHistoryPanel = ({ projectId }: HistoryPanelProps) => {
  const { data: historyData = [], isLoading, refetch } = useGetHistoryQuery(projectId);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<number | null>(null);
  const [updateLayer] = useUpdateLayerMutation();
  const [deleteHistory] = useDeleteHistoryMutation();

  const handleHistoryItemClick = useCallback(
    async (index: number) => {
      const selectedHistory = historyData[index];
      if (!selectedHistory) return;

      try {
        // Безопасное извлечение данных слоев из истории
        const historyData = selectedHistory.data;
        let layers: Layer[] = [];

        // Проверяем различные возможные структуры данных истории
        if (historyData?.layers && Array.isArray(historyData.layers)) {
          layers = historyData.layers;
        } else if (historyData?.data?.layers && Array.isArray(historyData.data.layers)) {
          layers = historyData.data.layers;
        } else {
          console.warn("No valid layers found in history entry:", selectedHistory);
          return;
        }

        console.log(`Restoring history state with ${layers.length} layers:`, layers);

        // Восстанавливаем состояние каждого слоя
        const updatePromises = layers.map(async (layer: Layer) => {
          try {
            await updateLayer({
              layerId: layer.id,
              projectId: projectId,
              data: {
                name: layer.name,
                order: layer.order,
                isVisible: layer.isVisible,
                opacity: layer.opacity,
                data: layer.data
              }
            }).unwrap();
          } catch (error) {
            console.error(`Failed to restore layer ${layer.id}:`, error);
            throw error;
          }
        });

        await Promise.all(updatePromises);
        
        setSelectedHistoryIndex(index);
        console.log(`History state restored successfully for index ${index}`);
        
      } catch (error) {
        console.error("Error restoring history state:", error);
        // Сбрасываем выделение при ошибке
        setSelectedHistoryIndex(null);
      }
    },
    [historyData, updateLayer, projectId]
  );

  const handleDeleteHistoryItem = useCallback(
    async (index: number) => {
      const historyItem = historyData[index];
      if (!historyItem) return;

      try {
        await deleteHistory({
          historyId: historyItem.id,
          projectId: projectId
        }).unwrap();

        console.log('History item deleted:', historyItem.id);
        
        // Сбрасываем выделение если удаляем выбранный элемент
        if (selectedHistoryIndex === index) {
          setSelectedHistoryIndex(null);
        }
        
        // Обновляем список истории
        refetch();
      } catch (error) {
        console.error('Error deleting history item:', error);
      }
    },
    [historyData, deleteHistory, projectId, selectedHistoryIndex, refetch]
  );

  if (isLoading) {
    return (
      <div style={{ padding: 16, textAlign: 'center' }}>
        Загрузка истории...
      </div>
    );
  }

  if (historyData.length === 0) {
    return (
      <div style={{ 
        padding: 16, 
        textAlign: 'center', 
        color: '#8B949E',
        fontSize: '14px'
      }}>
        История изменений пуста
      </div>
    );
  }

  return (
    <HistoryList
      history={historyData}
      selectedIndex={selectedHistoryIndex}
      onHistoryClick={handleHistoryItemClick}
      onHistoryDelete={handleDeleteHistoryItem}
    />
  );
};