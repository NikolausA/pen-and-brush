import React, { useState, useCallback } from "react";
import { Pane } from "evergreen-ui";
import { 
  useGetLayersQuery, 
  useCreateLayerMutation, 
  useUpdateLayerMutation, 
  useDeleteLayerMutation 
} from "@/core/store/api";
import { useHistoryManager } from "@/core/hooks";
import { LayerCreator, LayersList, OpacityControl } from "@/components/smart";
import type { Layer } from "@/core/types/interfaces/entities";

interface LayersManagerProps {
  projectId: string;
  activeLayerId: string | null;
  onLayerChange: (layerId: string) => void;
}

export const LayersManager = ({
  projectId,
  activeLayerId,
  onLayerChange,
}: LayersManagerProps) => {
  const { data: layersData = [], isLoading, refetch } = useGetLayersQuery(projectId);
  const [createLayer] = useCreateLayerMutation();
  const [updateLayer] = useUpdateLayerMutation();
  const [deleteLayer] = useDeleteLayerMutation();
  
  const { addLayerCreatedHistory, addLayerDeletedHistory } = useHistoryManager(projectId);

  // Находим активный слой
  const activeLayer = layersData.find(layer => layer.id === activeLayerId);
  const [localOpacity, setLocalOpacity] = useState(activeLayer?.opacity || 100);

  // Создание нового слоя
  const handleCreateLayer = useCallback(async () => {
    try {
      const newLayerData = {
        name: `Слой ${layersData.length + 1}`,
        order: layersData.length,
        isVisible: true,
        opacity: 100,
        data: []
      };

      const result = await createLayer({
        projectId,
        data: newLayerData
      }).unwrap();

      console.log('Layer created:', result);
      
      // Добавляем в историю
      const updatedLayers = [...layersData, result];
      addLayerCreatedHistory(newLayerData.name, updatedLayers);
      
      // Активируем новый слой
      onLayerChange(result.id);
      
      // Обновляем данные
      refetch();
    } catch (error) {
      console.error('Error creating layer:', error);
    }
  }, [createLayer, projectId, layersData, addLayerCreatedHistory, onLayerChange, refetch]);

  // Выбор слоя
  const handleLayerSelect = useCallback((layerId: string) => {
    const layer = layersData.find(l => l.id === layerId);
    if (layer) {
      onLayerChange(layerId);
      setLocalOpacity(layer.opacity || 100);
      console.log('Layer selected:', layerId);
    }
  }, [layersData, onLayerChange]);

  // Переключение видимости слоя
  const handleToggleVisibility = useCallback(async (layerId: string) => {
    const layer = layersData.find(l => l.id === layerId);
    if (!layer) return;

    try {
      await updateLayer({
        layerId: layer.id,
        projectId,
        data: {
          isVisible: !layer.isVisible
        }
      }).unwrap();

      console.log('Layer visibility toggled:', layerId, !layer.isVisible);
      refetch();
    } catch (error) {
      console.error('Error toggling layer visibility:', error);
    }
  }, [layersData, updateLayer, projectId, refetch]);

  // Удаление слоя
  const handleDeleteLayer = useCallback(async (layerId: string) => {
    const layer = layersData.find(l => l.id === layerId);
    if (!layer) return;

    // Предотвращаем удаление единственного слоя
    if (layersData.length <= 1) {
      console.warn('Cannot delete the last layer');
      return;
    }

    try {
      await deleteLayer({
        layerId: layer.id,
        projectId
      }).unwrap();

      console.log('Layer deleted:', layerId);
      
      // Добавляем в историю
      const updatedLayers = layersData.filter(l => l.id !== layerId);
      addLayerDeletedHistory(layer.name, updatedLayers);
      
      // Если удаляем активный слой, выбираем другой
      if (activeLayerId === layerId) {
        const remainingLayers = updatedLayers;
        if (remainingLayers.length > 0) {
          onLayerChange(remainingLayers[0].id);
        }
      }
      
      refetch();
    } catch (error) {
      console.error('Error deleting layer:', error);
    }
  }, [layersData, deleteLayer, projectId, addLayerDeletedHistory, activeLayerId, onLayerChange, refetch]);

  // Переименование слоя
  const handleRenameLayer = useCallback(async (layerId: string, newName: string) => {
    const layer = layersData.find(l => l.id === layerId);
    if (!layer || !newName.trim()) return;

    try {
      await updateLayer({
        layerId: layer.id,
        projectId,
        data: {
          name: newName.trim()
        }
      }).unwrap();

      console.log('Layer renamed:', layerId, newName);
      refetch();
    } catch (error) {
      console.error('Error renaming layer:', error);
    }
  }, [layersData, updateLayer, projectId, refetch]);

  // Изменение прозрачности
  const handleOpacityChange = useCallback(async (opacity: number) => {
    setLocalOpacity(opacity);
    
    if (!activeLayer) return;

    try {
      await updateLayer({
        layerId: activeLayer.id,
        projectId,
        data: {
          opacity: Math.max(0, Math.min(100, opacity))
        }
      }).unwrap();

      console.log('Layer opacity changed:', activeLayer.id, opacity);
      refetch();
    } catch (error) {
      console.error('Error changing layer opacity:', error);
    }
  }, [activeLayer, updateLayer, projectId, refetch]);

  // Обновляем локальную прозрачность при смене активного слоя
  React.useEffect(() => {
    if (activeLayer) {
      setLocalOpacity(activeLayer.opacity || 100);
    }
  }, [activeLayer]);

  if (isLoading) {
    return (
      <Pane width={300} padding={16}>
        <Pane>Загрузка слоев...</Pane>
      </Pane>
    );
  }

  return (
    <Pane 
      width={300} 
      style={{height: "600px"}}
      display="flex" 
      flexDirection="column" 
      borderLeft="1px solid #E4E7EB"
      background="white"
      height="300"
    >
      {/* Создание слоя */}
      <LayerCreator onCreateLayer={handleCreateLayer} />
      
      {/* Список слоев */}
      <LayersList
        layers={layersData}
        activeLayerId={activeLayerId}
        onLayerSelect={handleLayerSelect}
        onToggleVisibility={handleToggleVisibility}
        onDeleteLayer={handleDeleteLayer}
        onRenameLayer={handleRenameLayer}
      />
      
      {/* Контроль прозрачности активного слоя */}
      {activeLayer && (
        <OpacityControl
          opacity={localOpacity}
          onOpacityChange={handleOpacityChange}
        />
      )}
      
      {/* Информация о слоях */}
      <Pane padding={16} borderTop="1px solid #E4E7EB">
        <Pane fontSize="12px" color="#6B7280">
          Всего слоев: {layersData.length}
          {activeLayer && (
            <Pane marginTop={4}>
              Активный: {activeLayer.name}
            </Pane>
          )}
        </Pane>
      </Pane>
    </Pane>
  );
};