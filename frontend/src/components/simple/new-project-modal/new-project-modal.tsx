import { useNavigate } from 'react-router-dom';

import { Input } from '@/components/ordinary';
import { Button } from '@/components/ordinary';
import type { INewProjectModalProps } from '@/core/types/interfaces';
import { NEW_PROJECT_MODAL_INPUTS } from '@/core/constants';
import { useProjectFormValidation } from '@/core/hooks';

import styles from './new-project-modal.module.scss';

export const NewProjectModal = ({ isOpen, onClose }: INewProjectModalProps) => {
  const { values, errors, isValid, handleChange } = useProjectFormValidation({
    name: '',
    width: 800,
    height: 600,
  });
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!isValid) return;
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
    value: values[input.id as keyof typeof values],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      handleChange(input.id, input.id === 'name' ? e.target.value : Number(e.target.value)),
    error: errors[input.id],
  }));

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalBackdrop} onClick={onClose} />
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>Создание нового проекта</h2>
        {inputs.map((input) => (
          <Input
            key={input.id}
            id={input.id}
            label={input.label}
            type={input.type}
            value={input.value}
            onChange={input.onChange}
            placeholder={input.placeholder}
            error={input.error}
          />
        ))}
        <div className={styles.buttonGroup}>
          <Button onClick={onClose} variant="secondary">
            Отмена
          </Button>
          <Button onClick={handleCreate} variant="primary" disabled={!isValid}>
            Создать
          </Button>
        </div>
      </div>
    </div>
  );
};