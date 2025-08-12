import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Input, Button } from '@/components/ordinary';
import type { INewProjectModalProps } from '@/core/types/interfaces';
import { NEW_PROJECT_MODAL_INPUTS } from '@/core/constants';

import styles from './new-project-modal.module.scss';

export const NewProjectModal = ({ isOpen, onClose }: INewProjectModalProps) => {
  const [name, setName] = useState('');
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      const projectId = 1234; 
      navigate(`/projects/${projectId}`);
      onClose();
    } catch (error) {
      console.error('Ошибка при создании проекта:', error);
    }
  };

  const inputs = NEW_PROJECT_MODAL_INPUTS.map((input) => ({
    ...input,
    value: input.id === 'name' ? name : input.id === 'width' ? width : height,
    onChange:
      input.id === 'name'
        ? (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)
        : input.id === 'width'
        ? (e: React.ChangeEvent<HTMLInputElement>) => setWidth(Number(e.target.value))
        : (e: React.ChangeEvent<HTMLInputElement>) => setHeight(Number(e.target.value)),
  }));

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Создание нового проекта</h2>
        {inputs.map((input) => (
          <Input key={input.id} id={input.id} label={input.label}
            type={input.type} value={input.value} onChange={input.onChange}
            placeholder={input.placeholder}
          />
        ))}
        <div className={styles.buttonGroup}>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button onClick={handleCreate} variant="primary">
            Создать
          </Button>
        </div>
      </div>
    </div>
  );
};