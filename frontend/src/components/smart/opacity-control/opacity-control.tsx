import { Pane, Text } from "evergreen-ui";
import { Slider } from "@/components/ui";
// import type { ISliderProps } from "@/core/types/interfaces/ipages/ieditor"; // Если нужно

interface OpacityControlProps {
  opacity: number;
  onOpacityChange: (value: number) => void;
}

export const OpacityControl = ({
  opacity,
  onOpacityChange,
}: OpacityControlProps) => {
  return (
    <Pane padding={16} borderTop="1px solid #E4E7EB">
      <Text display="block" marginBottom={8}>
        Прозрачность
      </Text>
      <Slider
        min={0}
        max={100}
        step={1}
        value={opacity}
        onChange={onOpacityChange}
      />
    </Pane>
  );
};
