import type { ChangeEvent, HTMLInputTypeAttribute } from "react";

export interface IInputProps {
  id: string;
  label: string;
  type: HTMLInputTypeAttribute;
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
}

export interface IInputConfig {
  id: string;
  label: string;
  type: 'text' | 'number';
  value: string | number;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
}