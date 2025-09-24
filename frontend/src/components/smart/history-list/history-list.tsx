import { Pane, Text, IconButton } from "evergreen-ui";
import { History, Trash, RotateCwIcon } from "lucide-react";
import type { History as HistoryType } from "@/core/types/interfaces/entities";

interface HistoryListProps {
  history: HistoryType[];
  selectedIndex: number | null;
  onHistoryClick: (index: number) => void;
  onHistoryDelete?: (index: number) => void;
}

export const HistoryList = ({
  history,
  selectedIndex,
  onHistoryClick,
  onHistoryDelete,
}: HistoryListProps) => {
  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return 'Неизвестно';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      
      if (isToday) {
        return 'Сегодня';
      }
      
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return 'Неизвестно';
    }
  };

  if (history.length === 0) {
    return (
      <Pane 
        flex={1} 
        display="flex" 
        alignItems="center" 
        justifyContent="center" 
        padding={16}
      >
        <Pane textAlign="center">
          <Text color="#8B949E" size={400}>
            История изменений пуста
          </Text>
          <Text color="#8B949E" size={300} display="block" marginTop={4}>
            Начните рисовать, чтобы создать историю
          </Text>
        </Pane>
      </Pane>
    );
  }

  return (
    <Pane flex={1} overflowY="auto" padding={16} borderTop="1px solid #E4E7EB">
      <Pane display="flex" alignItems="center" marginBottom={12}>
        <History size={16} color="#6B7280" />
        <Text size={500} marginLeft={8} fontWeight={600}>
          История ({history.length})
        </Text>
      </Pane>
      
      {history.map((item, index) => {
        const isSelected = selectedIndex === index;
        const isFuture = selectedIndex !== null && index > selectedIndex;
        
        return (
          <Pane
            key={`${item.id}-${index}`}
            display="flex"
            alignItems="center"
            padding={12}
            borderRadius={6}
            marginBottom={6}
            background={isSelected ? "#F0F9FF" : "#F7F8FA"}
            border={isSelected ? "2px solid #3B82F6" : "1px solid #E5E7EB"}
            cursor="pointer"
            opacity={isFuture ? 0.5 : 1}
            transition="all 0.2s ease"
            onClick={() => onHistoryClick(index)}
            className="history-item"
          >
            <Pane flex={1}>
              <Pane display="flex" alignItems="center" marginBottom={4}>
                <RotateCwIcon 
                  size={14} 
                  color={isSelected ? "#3B82F6" : "#6B7280"} 
                />
                <Text 
                  size={400} 
                  fontWeight={isSelected ? 600 : 400}
                  color={isFuture ? "#9CA3AF" : "#374151"}
                >
                  {item.action}
                </Text>
              </Pane>
              
              <Pane display="flex" alignItems="center" gap={8}>
                <Text size={300} color="#8B949E">
                  {formatDate(item.createdAt)}
                </Text>
                <Text size={300} color="#8B949E">
                  {formatTime(item.createdAt)}
                </Text>
                {item.layerId && (
                  <>
                    <Text size={300} color="#8B949E">•</Text>
                    <Text size={300} color="#8B949E">
                      ID слоя: {item.layerId.slice(0, 8)}...
                    </Text>
                  </>
                )}
              </Pane>
            </Pane>
            
            {onHistoryDelete && !isFuture && (
              <IconButton
                icon={Trash}
                appearance="minimal"
                intent="danger"
                size="small"
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation();
                  onHistoryDelete(index);
                }}
                title="Удалить запись из истории"
              />
            )}
          </Pane>
        );
      })}
      
      {selectedIndex !== null && (
        <Pane 
          marginTop={16} 
          padding={12} 
          background="#F9FAFB" 
          borderRadius={6}
          border="1px solid #E5E7EB"
        >
          <Text size={300} color="#6B7280" display="block" marginBottom={4}>
            Текущее состояние:
          </Text>
          <Text size={400} fontWeight={500}>
            {history[selectedIndex]?.action || 'Не выбрано'}
          </Text>
          {selectedIndex < history.length - 1 && (
            <Text size={300} color="#8B949E" display="block" marginTop={4}>
              ⚠ Более новые изменения скрыты
            </Text>
          )}
        </Pane>
      )}
    </Pane>
  );
};