import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  Pane,
  Button,
  Card,
  Heading,
  majorScale,
  minorScale
} from 'evergreen-ui';
import type { IProjectCardProps } from '@/core/types/interfaces';

export const ProjectCard = ({ id, name, onDelete }: IProjectCardProps) => {
  const navigate = useNavigate();
  const [isBreaking, setIsBreaking] = useState(false);

  const handleOpen = () => {
    navigate(`/projects/${id}`);
  };

  const handleDelete = () => {
    setIsBreaking(true);
    setTimeout(() => {
      onDelete(id);
    }, 800);
  };

  return (
    <Pane
      width={majorScale(40)} 
      height={majorScale(25)} 
      transition="all 0.8s ease"
      elevation={0}
      borderRadius={8}
      background="white"
      border="default"
      opacity={isBreaking ? 0 : 1}
      transform={isBreaking ? "scale(0.95)" : "scale(1)"}
      margin={minorScale(3)} 
    >
      <Card display="flex" flexDirection="column" padding={majorScale(3)}> 
        <Pane padding={majorScale(3)}>
          <Heading size={600}> 
            {name}
          </Heading>
        </Pane>
        <Pane borderTop="muted" />
        <Pane 
          display="flex" 
          justifyContent="flex-end" 
          padding={majorScale(3)} 
        >
          <Button
            onClick={handleOpen}
            appearance="minimal"
            intent="none"
            marginRight={majorScale(2)} 
            height={majorScale(5)} 
            paddingX={minorScale(3)} 
            fontSize="14px" 
          >
            Открыть
          </Button>
          <Button
            onClick={handleDelete}
            appearance="minimal"
            intent="danger"
            height={majorScale(5)}
            paddingX={minorScale(3)} 
            fontSize="14px" 
          >
            Удалить
          </Button>
        </Pane>
      </Card>
    </Pane>
  );
};