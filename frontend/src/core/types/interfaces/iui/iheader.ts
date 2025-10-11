export interface IHeaderProps {
  title: string;
  buttonText: string;
  searchQuery: string;
  onButtonClick: () => void;
  onSearchChange: (value: string) => void;
}