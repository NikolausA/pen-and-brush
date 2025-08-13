import { useState } from 'react';

import { ButtonPrimary } from '@/components/ordinary';
import { NewProjectModal } from '@/components/simple/new-project-modal/new-project-modal';
import { ProjectList } from '@/components/smart/project-list/project-list';

import styles from './home.module.scss';

export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([
    { id: '1', name: 'My Project' },
    { id: '2', name: 'My Project' },
    { id: '3', name: 'My Project' },
    { id: '4', name: 'My Project' },
    { id: '5', name: 'My Project' },
    { id: '6', name: 'My Project' }
  ]);

  const handleClick = () => setIsModalOpen(true);

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return (
    <div className={styles.container}>
      <ButtonPrimary text="Новый проект" onClick={handleClick}/>
      <ProjectList projects={projects} onDelete={handleDelete} />
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};
