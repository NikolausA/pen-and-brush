import { useCallback } from "react";
import {
  useGetLayersQuery,
  useUpdateLayerMutation,
  useCreateLayerMutation,
  useDeleteLayerMutation,
} from "@/core/store/api";
import { useHistoryManager } from "@/core/hooks";
import { LayerCreator, LayersList, OpacityControl } from "@/components/smart";

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
  const { data: layersData } = useGetLayersQuery(projectId);
  const [createLayer] = useCreateLayerMutation();
  const [updateLayer] = useUpdateLayerMutation();
  const [deleteLayer] = useDeleteLayerMutation();
  const { addToHistory } = useHistoryManager(projectId);

  const activeLayer = layersData?.find((layer) => layer.id === activeLayerId);

  const handleCreateLayer = useCallback(async () => {
    const name = `Слой ${layersData?.length + 1 || 1}`;
    addToHistory(`Создан слой ${name}`, { layers: layersData });

    const newLayer = await createLayer({
      projectId,
      data: { name, isVisible: true, opacity: 100, data: [] },
    }).unwrap();

    onLayerChange(newLayer.id);
  }, [layersData, projectId, createLayer, onLayerChange, addToHistory]);

  const handleLayerSelect = useCallback(
    (layerId: string) => {
      onLayerChange(layerId);
    },
    [onLayerChange]
  );

  const handleToggleVisibility = useCallback(
    (layerId: string) => {
      const layer = layersData?.find((l) => l.id === layerId);
      if (layer) {
        addToHistory(`Изменена видимость слоя`, { layers: layersData });
        updateLayer({ id: layerId, data: { isVisible: !layer.isVisible } });
      }
    },
    [layersData, updateLayer, addToHistory]
  );

  const handleDeleteLayer = useCallback(
    (layerId: string) => {
      if (layersData && layersData.length <= 1) return;

      addToHistory(`Удален слой`, { layers: layersData });
      deleteLayer(layerId);

      // Переключаемся на другой слой если удаляем активный
      if (layerId === activeLayerId) {
        const remainingLayers = layersData.filter((l) => l.id !== layerId);
        onLayerChange(remainingLayers[0]?.id || "");
      }
    },
    [layersData, activeLayerId, deleteLayer, onLayerChange, addToHistory]
  );

  const handleOpacityChange = useCallback(
    (value: number) => {
      if (activeLayerId) {
        updateLayer({ id: activeLayerId, data: { opacity: value } });
      }
    },
    [activeLayerId, updateLayer]
  );

  const handleRenameLayer = useCallback(
    (layerId: string, newName: string) => {
      addToHistory(`Переименован слой`, { layers: layersData });
      updateLayer({ id: layerId, data: { name: newName } });
    },
    [layersData, updateLayer, addToHistory]
  );

  return (
    <>
      <LayerCreator onCreateLayer={handleCreateLayer} />
      <LayersList
        layers={layersData || []}
        activeLayerId={activeLayerId}
        onLayerSelect={handleLayerSelect}
        onToggleVisibility={handleToggleVisibility}
        onDeleteLayer={handleDeleteLayer}
        onRenameLayer={handleRenameLayer}
      />
      <OpacityControl
        opacity={activeLayer?.opacity ?? 100}
        onOpacityChange={handleOpacityChange}
      />
    </>
  );
};
