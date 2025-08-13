import type { IInputConfig } from "@/core/types/interfaces";

export const NEW_PROJECT_MODAL_INPUTS: IInputConfig[] = [
  {
    id: 'name',
    label: 'Название проекта',
    type: 'text',
    value: '',
    onChange: () => {}, 
    placeholder: 'Введите название проекта',
  },
  {
    id: 'width',
    label: 'Ширина (px)',
    type: 'number',
    value: 800,
    onChange: () => {}, 
    placeholder: 'Введите ширину холста (px)',
  },
  {
    id: 'height',
    label: 'Высота (px)',
    type: 'number',
    value: 600,
    onChange: () => {}, 
    placeholder: 'Введите высоту холста (px)',
  },
];