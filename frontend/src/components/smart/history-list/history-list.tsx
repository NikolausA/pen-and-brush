import { Pane, Text, IconButton } from "evergreen-ui";
import { History, Trash } from "lucide-react";
import type { History as HistoryType } from "@/core/types/interfaces/entities";

interface HistoryListProps {
  history: HistoryType[];
  selectedId: string | null;
  onHistoryClick: (item: HistoryType) => void;
  onHistoryDelete?: (item: HistoryType) => void;
}

export const HistoryList = ({
  history,
  selectedId,
  onHistoryClick,
  onHistoryDelete,
}: HistoryListProps) => {
  return (
    <Pane
      flex={1}
      height={200}
      overflowY="auto"
      padding={16}
      borderTop="1px solid #E4E7EB"
    >
      <Pane display="flex" alignItems="center" marginBottom={12}>
        <History size={16} color="#6B7280" />
        <Text size={500} marginLeft={8} fontWeight={600}>
          История ({history.length})
        </Text>
      </Pane>

      {/* Отображаем в обратном порядке (новые внизу) */}
      {[...history].reverse().map((item, reverseIndex) => {
        const index = history.length - 1 - reverseIndex;
        const isSelected = selectedId === item.id;
        const isFuture =
          selectedId !== null &&
          history.findIndex((h) => h.id === selectedId) < index;

        // ДИАГНОСТИКА
        console.log(`[${index}] ${item.action}:`, {
          isSelected,
          isFuture,
          hasDeleteHandler: !!onHistoryDelete,
          shouldShowButton: onHistoryDelete && !isFuture,
        });

        return (
          <Pane
            key={item.id}
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            background={isSelected ? "#F0F9FF" : "#F7F8FA"}
            border={isSelected ? "2px solid #3B82F6" : "1px solid #E5E7EB"}
            opacity={isFuture ? 0.5 : 1}
            padding={12}
            marginBottom={6}
            borderRadius={6}
            cursor="pointer"
          >
            <Pane flex={1} onClick={() => onHistoryClick(item)}>
              <Text>{item.action}</Text>
            </Pane>

            {onHistoryDelete && !isFuture && (
              <Pane marginLeft={8}>
                <IconButton
                  icon={Trash}
                  appearance="minimal"
                  intent="danger"
                  size="small"
                  onClick={(e: React.MouseEvent) => {
                    console.log("🚨 CLICK EVENT FIRED!");
                    e.stopPropagation();
                    e.preventDefault();
                    console.log("🚨 CALLING onHistoryDelete for:", item.action);
                    onHistoryDelete(item);
                  }}
                />
              </Pane>
            )}
          </Pane>
        );
      })}
    </Pane>
  );
};
