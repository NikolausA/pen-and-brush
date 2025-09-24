import { useState } from 'react';
import { Pane } from 'evergreen-ui';
import { FileMenu } from './file-menu';
import { EditMenu } from './edit-menu';

export const TopMenu = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  function undo() {
    console.log('undo');
  }

  function redo() {
    console.log('redo');
  }

  const handleCreateProject = () => {
    const newProjectId = crypto.randomUUID();
    console.log('create project', newProjectId);
  };

  return (
    <Pane
      background="tint1"
      borderBottom
      paddingX={16}
      paddingY={8}
      display="flex"
      gap={16}
      zIndex={9999}
    >
      <FileMenu
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        onCreateProject={handleCreateProject}
      />
      <EditMenu undo={undo} redo={redo} />
    </Pane>
  );
};