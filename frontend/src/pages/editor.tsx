import { Pane, IconButton, Text, Menu, Position, TextInput, Button } from 'evergreen-ui';
import { TopMenu } from '@/components/ui/top-menu/top-menu';
import { Canvas } from '@/components/smart';
import { ToolsPanel } from '@/components/smart';
import { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Slider } from '@/components/ui';
import type { DrawingElement, HistoryItem, Layer } from '@/core/types/interfaces/ipages/ieditor';



export const Editor = () => {
  const [activeTool, setActiveTool] = useState('brush');
  const [activeColor, setActiveColor] = useState('#000000');
  const [layers, setLayers] = useState<Layer[]>([
    {
      id: 'layer-1',
      name: 'Слой 1',
      visible: true,
      opacity: 100,
      elements: [],
    },
  ]);
  const [activeLayerId, setActiveLayerId] = useState('layer-1');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [renamingLayerId, setRenamingLayerId] = useState<string | null>(null);
  const [newLayerName, setNewLayerName] = useState('');
  const isDrawing = useRef(false);
  const draftElement = useRef<DrawingElement | null>(null);
  const nextId = useRef(0);

  const activeLayer = layers.find(layer => layer.id === activeLayerId) || layers[0];

  const handleToolSelect = (tool: string) => {
    setActiveTool(tool);
  };

  const handleColorSelect = (color: string) => {
    setActiveColor(color);
  };

  const handleMouseDown = useCallback((pos: { x: number; y: number }) => {
    isDrawing.current = true;
    const id = `element-${nextId.current++}`;
    
    if (activeTool === 'brush' || activeTool === 'eraser') {
      draftElement.current = {
        id,
        type: activeTool as 'brush' | 'eraser',
        points: [pos.x, pos.y],
        color: activeTool === 'eraser' ? '#ffffff' : activeColor,
      };
    } else {
      draftElement.current = {
        id,
        type: activeTool as 'rectangle' | 'circle' | 'triangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: activeColor,
      };
    }
    
    setHistory(prev => [...prev, {
      id: `history-${Date.now()}`,
      description: `Добавлен ${activeTool === 'brush' ? 'кисть' : 
                  activeTool === 'eraser' ? 'ластик' : 
                  activeTool === 'rectangle' ? 'прямоугольник' :
                  activeTool === 'circle' ? 'круг' : 'треугольник'}`,
      state: layers.map(layer => ({
        ...layer,
        elements: [...layer.elements]
      })),
    }]);

    setLayers(prev => prev.map(layer => {
      if (layer.id === activeLayerId) {
        return {
          ...layer,
          elements: [...layer.elements, draftElement.current!],
        };
      }
      return layer;
    }));
  }, [activeTool, activeColor, activeLayerId, layers]);

  const handleMouseMove = useCallback((pos: { x: number; y: number }) => {
    if (!isDrawing.current || !draftElement.current) return;

    setLayers(prev => prev.map(layer => {
      if (layer.id === activeLayerId) {
        const updatedElements = [...layer.elements];
        const lastIndex = updatedElements.length - 1;
        
        if (activeTool === 'brush' || activeTool === 'eraser') {
          updatedElements[lastIndex] = {
            ...updatedElements[lastIndex],
            points: [...(updatedElements[lastIndex].points || []), pos.x, pos.y]
          };
        } else {
          updatedElements[lastIndex] = {
            ...updatedElements[lastIndex],
            width: pos.x - (updatedElements[lastIndex].x || 0),
            height: pos.y - (updatedElements[lastIndex].y || 0)
          };
        }
        
        return {
          ...layer,
          elements: updatedElements,
        };
      }
      return layer;
    }));
  }, [activeTool, activeLayerId]);

  const handleMouseUp = useCallback(() => {
    isDrawing.current = false;
    draftElement.current = null;
  }, []);

  const handleCreateLayer = () => {
    const newLayerId = `layer-${Date.now()}`;
    const newLayer: Layer = {
      id: newLayerId,
      name: `Слой ${layers.length + 1}`,
      visible: true,
      opacity: 100,
      elements: [],
    };

    setHistory(prev => [...prev, {
      id: `history-${Date.now()}`,
      description: `Создан слой ${newLayer.name}`,
      state: layers.map(layer => ({
        ...layer,
        elements: [...layer.elements]
      })),
    }]);

    setLayers(prev => [...prev, newLayer]);
    setActiveLayerId(newLayerId);
  };

  const handleLayerSelect = (layerId: string) => {
    setActiveLayerId(layerId);
  };

  const handleToggleLayerVisibility = (layerId: string) => {
    setHistory(prev => [...prev, {
      id: `history-${Date.now()}`,
      description: `Изменена видимость слоя`,
      state: layers.map(layer => ({
        ...layer,
        elements: [...layer.elements]
      })),
    }]);

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        return {
          ...layer,
          visible: !layer.visible,
        };
      }
      return layer;
    }));
  };

  const handleDeleteLayer = (layerId: string) => {
    if (layers.length <= 1) return;

    setHistory(prev => [...prev, {
      id: `history-${Date.now()}`,
      description: `Удален слой`,
      state: layers.map(layer => ({
        ...layer,
        elements: [...layer.elements]
      })),
    }]);

    const newLayers = layers.filter(layer => layer.id !== layerId);
    setLayers(newLayers);

    if (layerId === activeLayerId) {
      setActiveLayerId(newLayers[0].id);
    }
  };

  const handleOpacityChange = (value: number) => {
    setLayers(prev => prev.map(layer => {
      if (layer.id === activeLayerId) {
        return {
          ...layer,
          opacity: value,
        };
      }
      return layer;
    }));
  };

  const startRenamingLayer = (layerId: string, currentName: string) => {
    setRenamingLayerId(layerId);
    setNewLayerName(currentName);
  };

  const handleRenameLayer = (layerId: string) => {
    setHistory(prev => [...prev, {
      id: `history-${Date.now()}`,
      description: `Переименован слой`,
      state: layers.map(layer => ({
        ...layer,
        elements: [...layer.elements]
      })),
    }]);

    setLayers(prev => prev.map(layer => {
      if (layer.id === layerId) {
        return {
          ...layer,
          name: newLayerName,
        };
      }
      return layer;
    }));
    setRenamingLayerId(null);
  };

  const handleHistoryItemClick = (index: number) => {
    const selectedState = history[index].state;
    setLayers(selectedState);
    
    setHistory(prev => prev.map((item, i) => ({
      ...item,
      isAfterSelected: i > index,
    })));
  };

  const toggleHistoryItemVisibility = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const item = history[index];
    const newVisibility = !item.state.some(layer => layer.visible);
    
    const updatedState = item.state.map(layer => ({
      ...layer,
      visible: newVisibility
    }));
    
    setLayers(updatedState);
    
    setHistory(prev => prev.map((histItem, i) => 
      i === index ? { ...histItem, state: updatedState } : histItem
    ));
  };

  const getAllVisibleElements = () => {
    return layers.flatMap(layer => 
      layer.visible 
        ? layer.elements.map(el => ({ ...el, opacity: layer.opacity / 100 }))
        : []
    );
  };

  return (
    <Pane display="flex" flexDirection="column" height="100vh" position="relative">
      <TopMenu />
      <DndProvider backend={HTML5Backend}>
        <ToolsPanel 
          onToolSelect={handleToolSelect}
          onColorSelect={handleColorSelect}
          activeTool={activeTool}
          activeColor={activeColor}
        />
        <Pane display="flex" flex={1}>
          <Canvas
            width={window.innerWidth - 300}
            height={window.innerHeight}
            elements={getAllVisibleElements()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            activeTool={activeTool}
          />
          <Pane
            width={300}
            height="100%"
            background="white"
            borderLeft="1px solid #E4E7EB"
            display="flex"
            flexDirection="column"
          >
            <Pane padding={16} borderBottom="1px solid #E4E7EB">
              <Button 
                width="100%" 
                appearance="primary" 
                intent="success"
                onClick={handleCreateLayer}
                iconBefore="plus"
              >
                Новый слой
              </Button>
            </Pane>

            <Pane flex={1} overflowY="auto" padding={16}>
              <Text size={500} marginBottom={8}>Слои</Text>
              {layers.map(layer => (
                <Pane 
                  key={layer.id}
                  display="flex"
                  alignItems="center"
                  padding={8}
                  background={layer.id === activeLayerId ? '#EDF0F2' : 'transparent'}
                  borderRadius={4}
                  marginBottom={4}
                  onClick={() => handleLayerSelect(layer.id)}
                  cursor="pointer"
                >
                  <IconButton 
                    icon={layer.visible ? 'eye-open' : 'eye-off'} 
                    appearance="minimal"
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleToggleLayerVisibility(layer.id);
                    }}
                  />
                  {renamingLayerId === layer.id ? (
                    <Pane display="flex" flex={1} marginX={8}>
                      <TextInput
                        value={newLayerName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLayerName(e.target.value)}
                        onBlur={() => handleRenameLayer(layer.id)}
                        onKeyDown={(e: React.KeyboardEvent) => {
                          if (e.key === 'Enter') {
                            handleRenameLayer(layer.id);
                          }
                        }}
                        width="100%"
                      />
                    </Pane>
                  ) : (
                    <Text flex={1} marginX={8} fontWeight={layer.id === activeLayerId ? 'bold' : 'normal'}>
                      {layer.name}
                    </Text>
                  )}
                  <Menu
                    position={Position.BOTTOM_RIGHT}
                    onDismiss={() => setRenamingLayerId(null)}
                  >
                    <Menu.Item
                      icon="edit"
                      onSelect={() => startRenamingLayer(layer.id, layer.name)}
                    >
                      Переименовать
                    </Menu.Item>
                    <Menu.Item
                      icon="trash"
                      intent="danger"
                      onSelect={() => handleDeleteLayer(layer.id)}
                    >
                      Удалить
                    </Menu.Item>
                  </Menu>
                </Pane>
              ))}
            </Pane>

            <Pane padding={16} borderTop="1px solid #E4E7EB">
              <Text display="block" marginBottom={8}>Прозрачность</Text>
              <Slider
                min={0}
                max={100}
                step={1}
                value={activeLayer.opacity}
                onChange={handleOpacityChange}
              />
            </Pane>

            <Pane flex={1} overflowY="auto" padding={16} borderTop="1px solid #E4E7EB">
              <Text size={500} marginBottom={8}>История</Text>
              {history.map((item, index) => (
                <Pane
                  key={item.id}
                  display="flex"
                  alignItems="center"
                  padding={8}
                  borderRadius={4}
                  marginBottom={4}
                  opacity={item.isAfterSelected ? 0.5 : 1}
                  background="#F7F8FA"
                  onClick={() => handleHistoryItemClick(index)}
                  cursor="pointer"
                >
                  <IconButton 
                    icon={item.state.some(l => l.visible) ? 'eye-open' : 'eye-off'} 
                    appearance="minimal"
                    onClick={(e) => toggleHistoryItemVisibility(index, e)}
                    marginRight={8}
                  />
                  <Text flex={1}>{item.description}</Text>
                </Pane>
              ))}
            </Pane>
          </Pane>
        </Pane>
      </DndProvider>
    </Pane>
  );
};