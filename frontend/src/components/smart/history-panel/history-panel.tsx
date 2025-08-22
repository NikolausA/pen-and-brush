import { useCallback } from "react";
import { Pane, Button, Text } from "evergreen-ui";
import { useAppDispatch, useAppSelector } from "@/core/store/hooks";
import { undo, redo, resetCanvas } from "@/core/store/slices/canvas-slice";
import { selectCanUndo, selectCanRedo } from "@/core/store/selectors";

export const HistoryPanel = () => {
  const dispatch = useAppDispatch();
  const canUndo = useAppSelector(selectCanUndo);
  const canRedo = useAppSelector(selectCanRedo);

  const handleUndo = useCallback(() => {
    dispatch(undo());
  }, [dispatch]);

  const handleRedo = useCallback(() => {
    dispatch(redo());
  }, [dispatch]);

  const handleClear = useCallback(() => {
    dispatch(resetCanvas());
  }, [dispatch]);

  return (
    <Pane padding={16}>
      <Text size={500} fontWeight={500} marginBottom={16}>
        История
      </Text>

      <Pane display="flex" gap={8} flexDirection="column">
        <Button
          disabled={!canUndo}
          onClick={handleUndo}
          size="small"
          appearance="default"
        >
          ↶ Отменить
        </Button>

        <Button
          disabled={!canRedo}
          onClick={handleRedo}
          size="small"
          appearance="default"
        >
          ↷ Вернуть
        </Button>

        <Button
          onClick={handleClear}
          size="small"
          intent="danger"
          appearance="default"
        >
          🗑 Очистить все
        </Button>
      </Pane>
    </Pane>
  );
};
