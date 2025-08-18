import { useState } from 'react';
import { Pane, Popover, Menu, Button } from 'evergreen-ui';

interface EditMenuProps {
  undo: () => void;
  redo: () => void;
}

export const EditMenu = ({ undo, redo } : EditMenuProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <Pane position="relative">
      <Popover
        isShown={isMenuOpen}
        onOpen={() => setIsMenuOpen(true)}
        onClose={() => setIsMenuOpen(false)}
        content={
          <Menu>
            <Menu.Item onSelect={undo}>Отменить</Menu.Item>
            <Menu.Item onSelect={redo}>Вернуть</Menu.Item>
          </Menu>
        }
      >
        <Button appearance="minimal" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          Правка
        </Button>
      </Popover>
    </Pane>
  );
};