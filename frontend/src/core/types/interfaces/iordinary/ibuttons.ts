export interface IButtonPrimaryProps {
  text: string;
  onClick: () => void;
}

export interface IButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}
