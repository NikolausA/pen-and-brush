// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { useCallback } from "react";
import { useAddHistoryMutation } from "@/core/store/api";
import type { Layer } from "@/core/types/interfaces/entities";

interface HistoryActionData {
  layers?: Layer[];
  [key: string]: unknown;
}

export const useHistoryManager = (projectId: string) => {
  const [addHistory] = useAddHistoryMutation();

  const addToHistory = useCallback(
    (action: string, payload: HistoryActionData) => {
      addHistory({
        projectId,
        data: {
          action, // верхний action
          data: {
            action, // вложенный action (по твоей схеме)
            data: payload,
          },
        } as Partial<History>,
      });
    },
    [addHistory, projectId]
  );

  return { addToHistory };
};
