import { useState } from "react";
import { Pane, Button, TextInput, Text } from "evergreen-ui";
import { Plus, Layers } from "lucide-react";

interface LayerCreatorProps {
  onCreateLayer: () => void;
}

export const LayerCreator = ({ onCreateLayer }: LayerCreatorProps) => {
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateClick = async () => {
    setIsCreating(true);
    try {
      await onCreateLayer();
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Pane padding={16} borderBottom="1px solid #E4E7EB" background="#FAFBFC">
      <Pane display="flex" alignItems="center" marginBottom={12}>
        <Layers size={16} color="#6B7280" />
        <Text size={500} marginLeft={8} fontWeight={600} color="#374151">
          Управление слоями
        </Text>
      </Pane>
      
      <Button
        width="100%"
        appearance="primary"
        intent="success"
        onClick={handleCreateClick}
        iconBefore={Plus}
        isLoading={isCreating}
        disabled={isCreating}
      >
        {isCreating ? "Создание..." : "Новый слой"}
      </Button>
      
      <Text 
        size={300} 
        color="#8B949E" 
        textAlign="center" 
        display="block" 
        marginTop={8}
      >
        Создайте новый слой для рисования
      </Text>
    </Pane>
  );
};