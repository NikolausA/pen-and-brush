export interface IProjectCardProps {
  id: string;
  name: string;
  onDelete: (id: string) => void;
}

export interface IProject {
  id: string;
  name: string;
}

export interface IProjectListProps {
  projects: IProject[];
  onDelete: (id: string) => void;
}