import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProjectList } from '@/components/smart/project-list';
import { jest } from '@jest/globals';
import type { Project } from '@/core/types/interfaces/entities';

describe('ProjectList Component', () => {
  const mockProjects: Project[] = [
    { id: '1', name: 'Project 1', width: 800, height: 600, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: '2', name: 'Project 2', width: 1024, height: 768, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  ];
  const mockOnDelete = jest.fn();

  it('renders project cards when projects are provided', () => {
    render(
      <MemoryRouter>
        <ProjectList projects={mockProjects} onDelete={mockOnDelete} />
      </MemoryRouter>
    );
    expect(screen.getByText('Project 1')).toBeInTheDocument();
    expect(screen.getByText('Project 2')).toBeInTheDocument();
  });

  it('displays "Проекты отсутствуют" when no projects are provided', () => {
    render(
      <MemoryRouter>
        <ProjectList projects={[]} onDelete={mockOnDelete} />
      </MemoryRouter>
    );
    expect(screen.getByText('Проекты отсутствуют')).toBeInTheDocument();
  });

  it('navigates to project page when clicking "Открыть"', async () => {
    render(
      <MemoryRouter>
        <ProjectList projects={mockProjects} onDelete={mockOnDelete} />
      </MemoryRouter>
    );
    const openButton = screen.getAllByText('Открыть')[0];
    await userEvent.click(openButton);
    // Note: Navigation testing requires mocking useNavigate
  });

  it('triggers delete action when clicking "Удалить"', async () => {
    render(
      <MemoryRouter>
        <ProjectList projects={mockProjects} onDelete={mockOnDelete} />
      </MemoryRouter>
    );
    const deleteButton = screen.getAllByText('Удалить')[0];
    await userEvent.click(deleteButton);
    await waitFor(() => {
      expect(mockOnDelete).toHaveBeenCalledWith('1');
    });
  });
});