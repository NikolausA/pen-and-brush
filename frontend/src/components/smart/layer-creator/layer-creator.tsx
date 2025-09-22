import { Pane, Button, PlusIcon } from "evergreen-ui";

interface LayerCreatorProps {
  onCreateLayer: () => void;
}

export const LayerCreator = ({ onCreateLayer }: LayerCreatorProps) => {
  return (
    <Pane padding={16} borderBottom="1px solid #E4E7EB">
      <Button
        width="100%"
        appearance="primary"
        intent="success"
        onClick={onCreateLayer}
        iconBefore={PlusIcon}
      >
        Новый слой
      </Button>
    </Pane>
  );
};
