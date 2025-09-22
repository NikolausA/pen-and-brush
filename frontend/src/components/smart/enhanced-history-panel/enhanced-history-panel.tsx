import { useState, useCallback } from "react";
import { useGetHistoryQuery, useUpdateLayerMutation } from "@/core/store/api";
import { HistoryList } from "@/components/smart";
import type { Layer } from "@/core/types/interfaces/entities";

interface HistoryPanelProps {
  projectId: string;
}

export const EnhancedHistoryPanel = ({ projectId }: HistoryPanelProps) => {
  const { data: historyData } = useGetHistoryQuery(projectId);
  const [selectedHistoryIndex, setSelectedHistoryIndex] = useState<
    number | null
  >(null);
  const [updateLayer] = useUpdateLayerMutation();

  const handleHistoryItemClick = useCallback(
    async (index: number) => {
      const selectedHistory = historyData?.[index];

      // Безопасное обращение через optional chaining и type assertion
      const historyEntry = selectedHistory as any;
      const layers = historyEntry?.data?.data?.layers;

      if (Array.isArray(layers)) {
        const selectedState = layers as Layer[];

        try {
          await Promise.all(
            selectedState.map((layer: Layer) =>
              updateLayer({ id: layer.id, data: layer }).unwrap()
            )
          );
          setSelectedHistoryIndex(index);
        } catch (error) {
          console.error("Error restoring history state:", error);
        }
      } else {
        console.warn("No layers found in history entry:", selectedHistory);
      }
    },
    [historyData, updateLayer]
  );

  return (
    <HistoryList
      history={historyData || []}
      selectedIndex={selectedHistoryIndex}
      onHistoryClick={handleHistoryItemClick}
    />
  );
};
