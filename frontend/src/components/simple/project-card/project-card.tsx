import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import { Button } from '@/components/ordinary';
import type { IProjectCardProps } from '@/core/types/interfaces';

import styles from './project-card.module.scss';

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
    <div className={`${styles.card} ${isBreaking ? styles.break : ''}`}>
      <h3 className={styles.title}>{name}</h3>
      <div className={styles.divider}></div>
      <div className={styles.actions}>
        <Button onClick={handleOpen} variant="secondary">Открыть</Button>
        <Button onClick={handleDelete} variant="danger">Удалить</Button>
      </div>
    </div>
  );
};
