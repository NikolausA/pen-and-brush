import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pane, Popover, Menu, Button } from 'evergreen-ui';
import { NewProjectModal } from '@/components/simple';


interface FileMenuProps {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  onCreateProject: (name: string, width: number, height: number) => void;
}

export const FileMenu = ({ isModalOpen, setIsModalOpen, onCreateProject }: FileMenuProps) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function saveProject() {
    console.log('save');
  }

  const handleExport = () => {
    console.log('Экспорт в PNG');
  };

  return (
    <Pane position="relative">
      <Popover
        isShown={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
        content={
          <Menu>
            <Menu.Item onSelect={() => setIsModalOpen(true)}>Новый проект</Menu.Item>
            <Menu.Item onSelect={saveProject}>Сохранить</Menu.Item>
            <Menu.Item onSelect={handleExport}>Экспорт в PNG</Menu.Item>
            <Menu.Item onSelect={() => navigate('/')}>Все проекты</Menu.Item>
          </Menu>
        }
      >
        <Button appearance="minimal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          Файл
        </Button>
      </Popover>
      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={onCreateProject}
      />
    </Pane>
  );
};