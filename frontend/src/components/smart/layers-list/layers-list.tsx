import { useState } from "react";
import {
  Pane,
  Text,
  IconButton,
  TextInput,
  Popover,
  Menu,
  Position,
  EyeOpenIcon,
  EyeOffIcon,
  MoreIcon,
  TrashIcon,
  EditIcon,
} from "evergreen-ui";
import type { Layer } from "@/core/types/domain/entities";

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
    onRenameLayer(layerId, newLayerName);
    setRenamingLayerId(null);
  };

  return (
    <Pane flex={1} overflowY="auto" padding={16}>
      <Text size={500} marginBottom={8}>
        Слои
      </Text>
      {layers.map((layer) => (
        <Pane
          key={layer.id}
          display="flex"
          alignItems="center"
          padding={8}
          background={layer.id === activeLayerId ? "#EDF0F2" : "transparent"}
          borderRadius={4}
          marginBottom={4}
          onClick={() => onLayerSelect(layer.id)}
          cursor="pointer"
        >
          <IconButton
            icon={layer.isVisible ? EyeOpenIcon : EyeOffIcon} // Use icon components
            appearance="minimal"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onToggleVisibility(layer.id);
            }}
          />
          {renamingLayerId === layer.id ? (
            <Pane display="flex" flex={1} marginX={8}>
              <TextInput
                value={newLayerName}
                onChange={(e) => setNewLayerName(e.target.value)}
                onBlur={() => handleRename(layer.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename(layer.id);
                }}
                width="100%"
              />
            </Pane>
          ) : (
            <Text
              flex={1}
              marginX={8}
              fontWeight={layer.id === activeLayerId ? "bold" : "normal"}
            >
              {layer.name}
            </Text>
          )}
          <Popover
            position={Position.BOTTOM_RIGHT}
            content={
              <Menu>
                <Menu.Item
                  icon={EditIcon}
                  onSelect={() => startRenaming(layer.id, layer.name)}
                >
                  Переименовать
                </Menu.Item>
                <Menu.Item
                  icon={TrashIcon}
                  intent="danger"
                  onSelect={() => onDeleteLayer(layer.id)}
                >
                  Удалить
                </Menu.Item>
              </Menu>
            }
          >
            <IconButton icon={MoreIcon} appearance="minimal" />{" "}
            {/* Fix this too, see below */}
          </Popover>
        </Pane>
      ))}
    </Pane>
  );
};
