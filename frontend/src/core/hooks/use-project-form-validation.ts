import { useState, useEffect } from 'react';

interface FormValues {
  name: string;
  width: number;
  height: number;
}

interface FormErrors {
  [key: string]: string;
}

interface ProjectFormValidation {
  values: FormValues;
  errors: FormErrors;
  isValid: boolean;
  handleChange: (id: string, value: string | number) => void;
}

export const useProjectFormValidation = (initialValues: FormValues): ProjectFormValidation => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isValid, setIsValid] = useState(false);

  const validateField = (id: string, value: string | number): string => {
    switch (id) {
      case 'name':
        return value.toString().trim() === '' ? 'Название проекта не может быть пустым' : '';
      case 'width':
        if (value.toString().trim() === '') return 'Ширина не может быть пустой';
        if (Number(value) <= 0) return 'Ширина должна быть больше 0';
        if (Number(value) < 100) return 'Ширина должна быть не менее 100 пикселей';
        return '';
      case 'height':
        if (value.toString().trim() === '') return 'Высота не может быть пустой';
        if (Number(value) <= 0) return 'Высота должна быть больше 0';
        if (Number(value) < 100) return 'Высота должна быть не менее 100 пикселей';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (values: FormValues): { errors: FormErrors; isValid: boolean } => {
    const newErrors: FormErrors = {
      name: validateField('name', values.name),
      width: validateField('width', values.width),
      height: validateField('height', values.height),
    };
    const formIsValid = Object.values(newErrors).every((error) => error === '');
    return { errors: newErrors, isValid: formIsValid };
  };

  useEffect(() => {
    const { errors: initialErrors, isValid: initialIsValid } = validateForm(values);
    setErrors(initialErrors);
    setIsValid(initialIsValid);
  }, [ ]); 

  const handleChange = (id: string, value: string | number) => {
    const newValue = id === 'name' ? value.toString() : Number(value);
    const newValues = { ...values, [id]: newValue };
    const { errors: newErrors, isValid: formIsValid } = validateForm(newValues);

    setValues(newValues);
    setErrors(newErrors);
    setIsValid(formIsValid);
  };

  return {
    values,
    errors,
    isValid,
    handleChange,
  };
};