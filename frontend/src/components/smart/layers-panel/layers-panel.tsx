import { useCallback, useState } from "react";
import { Pane, Button, Text, Switch, Slider, TextInput } from "evergreen-ui";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import {
  addLayer,
  setActiveLayer,
  renameLayer,
  setLayerOpacity,
  toggleLayerVisibility,
  deleteLayer,
} from "@/core/store/slices/canvas-slice";
import { selectLayers, selectActiveLayerId } from "@/core/store/selectors";

export const LayersPanel = () => {
  const dispatch = useAppDispatch();
  const layers = useAppSelector(selectLayers);
  const activeLayerId = useAppSelector(selectActiveLayerId);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");

  const handleAddLayer = useCallback(() => {
    dispatch(addLayer());
  }, [dispatch]);

  const handleLayerSelect = useCallback(
    (layerId: string) => {
      dispatch(setActiveLayer(layerId));
    },
    [dispatch]
  );

  const handleRename = useCallback(
    (layerId: string, newName: string) => {
      dispatch(renameLayer({ id: layerId, name: newName }));
    },
    [dispatch]
  );

  return (
    <Pane padding={16} borderBottom="muted">
      <Pane
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        marginBottom={16}
      >
        <Text size={500} fontWeight={500}>
          Слои
        </Text>
        <Button size="small" onClick={handleAddLayer}>
          + Добавить
        </Button>
      </Pane>

      <Pane>
        {layers.map((layer) => (
          <Pane
            key={layer.id}
            padding={12}
            marginBottom={8}
            border={activeLayerId === layer.id ? "default" : "muted"}
            borderRadius={4}
            backgroundColor={activeLayerId === layer.id ? "tint1" : "white"}
            cursor="pointer"
            onClick={() => handleLayerSelect(layer.id)}
          >
            <Pane
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              marginBottom={8}
            >
              {editingId === layer.id ? (
                <TextInput
                  value={name}
                  onChange={(e: any) => setName(e.target.value)}
                  onBlur={() => {
                    handleRename(layer.id, name);
                    setEditingId(null);
                  }}
                  autoFocus
                />
              ) : (
                <Text
                  fontWeight={activeLayerId === layer.id ? 500 : 400}
                  onDoubleClick={() => {
                    setEditingId(layer.id);
                    setName(layer.name);
                  }}
                >
                  {layer.name}
                </Text>
              )}

              <Pane display="flex" alignItems="center" gap={8}>
                <Switch
                  checked={layer.visible}
                  onChange={() => dispatch(toggleLayerVisibility(layer.id))}
                  size="small"
                />
                {layers.length > 1 && (
                  <Button
                    size="small"
                    intent="danger"
                    appearance="minimal"
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(deleteLayer(layer.id));
                    }}
                  >
                    ✕
                  </Button>
                )}
              </Pane>
            </Pane>

            <Pane>
              <Text size={300} color="muted" marginBottom={4}>
                Прозрачность: {Math.round(layer.opacity * 100)}%
              </Text>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={layer.opacity}
                onChange={(opacity) =>
                  dispatch(setLayerOpacity({ id: layer.id, opacity }))
                }
              />
            </Pane>
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
};
