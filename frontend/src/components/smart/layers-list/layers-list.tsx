import { useState } from "react";
import {
  Pane,
  Text,
  IconButton,
  TextInput,
  Popover,
  Menu,
  Position,
} from "evergreen-ui";
import { FiEye, FiEyeOff, FiMoreVertical, FiTrash, FiEdit } from "react-icons/fi";
import type { Layer } from "@/core/types/interfaces/entities";

interface LayersListProps {
  layers: Layer[];
  activeLayerId: string | null;
  onLayerSelect: (layerId: string) => void;
  onToggleVisibility: (layerId: string) => void;
  onDeleteLayer: (layerId: string) => void;
  onRenameLayer: (layerId: string, newName: string) => void;
}

export const LayersList = ({
  layers,
  activeLayerId,
  onLayerSelect,
  onToggleVisibility,
  onDeleteLayer,
  onRenameLayer,
}: LayersListProps) => {
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
  const [newLayerName, setNewLayerName] = useState("");

  const startRenaming = (layerId: string, currentName: string) => {
    setRenamingLayerId(layerId);
    setNewLayerName(currentName);
  };

  const handleRename = (layerId: string) => {
    if (newLayerName.trim()) {
      onRenameLayer(layerId, newLayerName.trim());
    }
    setRenamingLayerId(null);
  };

  const cancelRenaming = () => {
    setRenamingLayerId(null);
    setNewLayerName("");
  };

  // Сортируем слои по порядку (order) для правильного отображения
  const sortedLayers = [...layers].sort((a, b) => (b.order || 0) - (a.order || 0));

  if (layers.length === 0) {
    return (
      <Pane flex={1} padding={16} display="flex" alignItems="center" justifyContent="center">
        <Text color="#8B949E">Нет слоев. Создайте первый слой.</Text>
      </Pane>
    );
  }

  return (
    <Pane flex={1} overflowY="auto" padding={16}>
      <Text size={500} marginBottom={12} fontWeight={600}>
        Слои ({layers.length})
      </Text>

      {sortedLayers.map((layer) => (
        <Pane
          key={layer.id}
          display="flex"
          alignItems="center"
          padding={12}
          background={layer.id === activeLayerId ? "#F0F9FF" : "transparent"}
          border={layer.id === activeLayerId ? "2px solid #3B82F6" : "1px solid transparent"}
          borderRadius={8}
          marginBottom={8}
          onClick={() => onLayerSelect(layer.id)}
          cursor="pointer"
          transition="all 0.2s ease"
          className="layer-item"
          style={{
            opacity: layer.isVisible ? 1 : 0.6,
          }}
        >
          {/* Видимость слоя */}
          <IconButton
            icon={layer.isVisible ? FiEye : FiEyeOff}
            appearance="minimal"
            size="small"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleVisibility(layer.id);
            }}
            title={layer.isVisible ? "Скрыть слой" : "Показать слой"}
          />

          {/* Название слоя или поле ввода для переименования */}
          {renamingLayerId === layer.id ? (
            <Pane display="flex" flex={1} marginX={8}>
              <TextInput
                value={newLayerName}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLayerName(e.target.value)}
                onBlur={() => handleRename(layer.id)}
                onKeyDown={(e: React.KeyboardEvent) => {
                  if (e.key === "Enter") {
                    handleRename(layer.id);
                  } else if (e.key === "Escape") {
                    cancelRenaming();
                  }
                }}
                width="100%"
                size="small"
                autoFocus
              />
            </Pane>
          ) : (
            <Pane flex={1} marginX={8}>
              <Text
                fontWeight={layer.id === activeLayerId ? 600 : 400}
                color={layer.id === activeLayerId ? "#1F2937" : "#4B5563"}
                size={400}
              >
                {layer.name}
              </Text>

              {/* Дополнительная информация о слое */}
              <Text size={300} color="#8B949E" marginTop={2}>
                Прозрачность: {layer.opacity || 100}%
                {layer.data && Array.isArray(layer.data) && (
                  <span> • Объектов: {layer.data.length}</span>
                )}
              </Text>
            </Pane>
          )}

          {/* Меню действий */}
          {renamingLayerId !== layer.id && (
            <Popover
              position={Position.BOTTOM_RIGHT}
              content={
                <Menu>
                  <Menu.Item icon={FiEdit} onSelect={() => startRenaming(layer.id, layer.name)}>
                    Переименовать
                  </Menu.Item>
                  <Menu.Divider />
                  <Menu.Item
                    icon={FiTrash}
                    intent="danger"
                    onSelect={() => onDeleteLayer(layer.id)}
                    disabled={layers.length <= 1}
                  >
                    Удалить
                  </Menu.Item>
                </Menu>
              }
            >
              <IconButton
                icon={FiMoreVertical}
                appearance="minimal"
                size="small"
                title="Действия со слоем"
              />
            </Popover>
          )}
        </Pane>
      ))}

      {/* Информация о активном слое */}
      {activeLayerId && (
        <Pane
          marginTop={16}
          padding={12}
          background="#F9FAFB"
          borderRadius={6}
          border="1px solid #E5E7EB"
        >
          <Text size={300} color="#6B7280" display="block" marginBottom={4}>
            Активный слой:
          </Text>
          <Text size={400} fontWeight={500}>
            {sortedLayers.find((l) => l.id === activeLayerId)?.name || "Не найден"}
          </Text>
        </Pane>
      )}
    </Pane>
  );
};