import { useState, useEffect, useCallback } from "react";
import { Pane, Text, TextInput } from "evergreen-ui";
import { Eye } from "lucide-react";

interface OpacityControlProps {
  opacity: number;
  onOpacityChange: (value: number) => void;
}

export const OpacityControl = ({
  opacity,
  onOpacityChange,
}: OpacityControlProps) => {
  const [localValue, setLocalValue] = useState(opacity);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) {
      setLocalValue(opacity);
    }
  }, [opacity, isDragging]);

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value);
    setLocalValue(newValue);
    onOpacityChange(newValue);
  }, [onOpacityChange]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numValue = parseInt(value) || 0;
    const clampedValue = Math.max(0, Math.min(100, numValue));
    setLocalValue(clampedValue);
    onOpacityChange(clampedValue);
  }, [onOpacityChange]);

  return (
    <Pane padding={16} borderTop="1px solid #E4E7EB" background="#FAFBFC">
      <Pane display="flex" alignItems="center" marginBottom={12}>
        <Eye size={16} color="#6B7280" />
        <Text size={500} marginLeft={8} fontWeight={600}>
          Прозрачность
        </Text>
      </Pane>
      
      <Pane display="flex" alignItems="center" gap={12}>
        <input
          type="range"
          min="0"
          max="100"
          value={localValue}
          onChange={handleSliderChange}
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
          style={{
            flex: 1,
            height: '6px',
            borderRadius: '3px',
            background: '#E5E7EB',
            outline: 'none',
            cursor: 'pointer'
          }}
        />
        
        <Pane display="flex" alignItems="center" gap={4}>
          <TextInput
            value={localValue}
            onChange={handleInputChange}
            width={60}
            textAlign="center"
            size="small"
          />
          <Text size={300} color="#6B7280">%</Text>
        </Pane>
      </Pane>
      
      <Pane marginTop={8}>
        <Text size={300} color="#8B949E" textAlign="center">
          0% - прозрачный, 100% - непрозрачный
        </Text>
      </Pane>
    </Pane>
  );
};