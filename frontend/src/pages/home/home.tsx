import { useState } from 'react';

import { ButtonPrimary } from '@/components/ordinary';

import styles from './home.module.scss';
import { NewProjectModal } from '@/components/simple/new-project-modal/new-project-modal';


export const Home = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    setIsModalOpen(true)
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Проекты отсутствуют</h1>
      <ButtonPrimary text="Новый проект" onClick={handleClick}/>
      <NewProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};