// frontend/src/components/simple/NewProjectModal.tsx
import { useState } from "react";
import { Dialog, Pane, TextInput, Paragraph } from "evergreen-ui";

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, width: number, height: number) => Promise<void>;
}

export const NewProjectModal = ({
  isOpen,
  onClose,
  onCreate,
}: NewProjectModalProps) => {
  const [name, setName] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!name || !width || !height) {
      setError("Все поля должны быть заполнены");
      return;
    }

    const widthNum = parseInt(width);
    const heightNum = parseInt(height);

    if (
      isNaN(widthNum) ||
      isNaN(heightNum) ||
      widthNum <= 0 ||
      heightNum <= 0
    ) {
      setError("Ширина и высота должны быть положительными числами");
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreate(name, widthNum, heightNum);
      setName("");
      setWidth("");
      setHeight("");
      setError("");
      onClose();
    } catch {
      setError("Не удалось создать проект. Попробуйте снова.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      isShown={isOpen}
      title="Создать новый проект"
      onCloseComplete={onClose}
      confirmLabel={isSubmitting ? "Создание..." : "Создать"}
      cancelLabel="Отмена"
      onConfirm={handleSubmit}
      isConfirmLoading={isSubmitting}
      width={480}
    >
      <Pane display="flex" flexDirection="column" gap={16}>
        <TextInput
          placeholder="Название проекта"
          value={name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setName(e.target.value)
          }
          width="100%"
          disabled={isSubmitting}
        />
        <TextInput
          type="number"
          placeholder="Ширина (px)"
          value={width}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setWidth(e.target.value)
          }
          width="100%"
          disabled={isSubmitting}
        />
        <TextInput
          type="number"
          placeholder="Высота (px)"
          value={height}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setHeight(e.target.value)
          }
          width="100%"
          disabled={isSubmitting}
        />
        {error && <Paragraph color="danger">{error}</Paragraph>}
      </Pane>
    </Dialog>
  );
};
