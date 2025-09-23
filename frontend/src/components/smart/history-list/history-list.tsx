import { Pane, Text } from "evergreen-ui";
import type { History } from "@/core/types/interfaces/entities";
interface HistoryListProps {
  history: History[];
  selectedIndex: number | null;
  onHistoryClick: (index: number) => void;
}

export const HistoryList = ({
  history,
  selectedIndex,
  onHistoryClick,
}: HistoryListProps) => {
  return (
    <Pane flex={1} overflowY="auto" padding={16} borderTop="1px solid #E4E7EB">
      <Text size={500} marginBottom={8}>
        История
      </Text>
      {history.map((item, index) => (
        <Pane
          key={item.id}
          display="flex"
          alignItems="center"
          padding={8}
          borderRadius={4}
          marginBottom={4}
          background="#F7F8FA"
          onClick={() => onHistoryClick(index)}
          cursor="pointer"
          opacity={selectedIndex !== null && index > selectedIndex ? 0.5 : 1}
        >
          <Text flex={1}>{item.action}</Text>
        </Pane>
      ))}
    </Pane>
  );
};
